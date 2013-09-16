define([
  'underscore', 'backbone', 'resthub', 'hbs!template/subreddit', 'hbs!template/post-row-small', 'hbs!template/post-row-grid', 'view/post-row-view', 'view/sidebar-view', 'view/base-view', 'collection/subreddit', 'event/channel', 'cookie'],
	function(_, Backbone, Resthub, subredditTmpl, PostViewSmallTpl, PostRowGrid, PostRowView, SidebarView, BaseView, SubredditCollection, channel, Cookie) {
		var SubredditView = BaseView.extend({

			el: $(".content"),
			template: subredditTmpl,

			events: function() {
				var _events = {
					//'click .tabmenu-right li': 'changeGridOption',
					'click #retry': 'tryAgain',
					'click .thumbnailSmall': 'gotoSingle',
					'click .nextprev': 'fetchMore'

				};
				//console.log('click .upArrow' + this.options.id)
				_events['click .upArrow' + this.options.id] = "upvote";
				_events['click .downArrow' + this.options.id] = "downvote";
				return _events;
			},

			initialize: function(options) {
				//$(this.el).empty()
				//this.$el.empty()
				this.$('#siteTable').empty()
				this.$el.empty()

				_.bindAll(this);
				var self = this;
				this.subName = options.subName
				this.template = subredditTmpl;
				this.sortOrder = options.sortOrder
				this.subID = this.subName + this.sortOrder
				if (typeof this.sortOrder === 'undefined') {
					this.sortOrder = 'hot'
				}

				channel.on("subreddit:changeGridOption", this.changeGridOption, this);
				channel.on("subreddit:remove", this.remove, this);

				this.render();
				this.imagesAdded = 0; //keeps a total of how many images we are loading
				this.initGridOption();

				this.imgAry = new Array()

				$(this.el).prepend("<style id='dynamicWidth'> </style>")
				//console.log("window.subs=", window.subs)

				this.collection = new SubredditCollection({
					subName: this.subName,
					sortOrder: this.sortOrder
				});
				this.collection.readLocalStorage();

				if (this.collection.length > 1) {
					this.appendPosts(this.collection)
					this.showMoarBtn()
				} else {
					this.fetchMore();
				}

				$(window).on("scroll", this.watchScroll);

				//in small thumbnail mode, its sometimes impossible for the infinite scroll event to fire because there is no scrollbar yet
				this.helpFillUpScreen();

				//this.target = $("#siteTable"); //the target to test for infinite scroll
				this.target = $(window); //the target to test for infinite scroll
				this.loading = false;

				this.scrollOffset = 1000;
				this.prevScrollY = 0; //makes sure you are not checking when the user scrolls upwards
				this.errorRetries = 0; //keeps track of how many errors we will retry after

				//$(window).bind("resize.app", _.bind(this.debouncer));
				$(window).resize(this.debouncer(function(e) {
					self.resize()
				}));

				this.resize()

				setTimeout(function() {
					self.changeSortOrderCss()
				}, 100);

				this.countAllImgs = 0 //delete this later

			},
			//we have to override the remove event because the window.scroll event will not be removed by the garbage collector
			//cant create infinite scroll without this.
			remove: function() {
				var self = this

				this.removePendingGrid()
				window.stop() //prevents new images from being downloaded
				$(window).off("scroll", this.watchScroll);
				$(window).off('resize', this.debouncer);
				channel.off("subreddit:changeGridOption", this.changeGridOption, this);
				channel.off("subreddit:remove", this.remove, this);
				this.undelegateEvents();
				this.$el.empty();
				this.stopListening();
				console.log('**********************removed the view *********************************')

				//call the superclass remove method
				//Backbone.View.prototype.remove.apply(this, arguments);
			},
			//the image callback from waiting it to be loaded before being display
			//this needs to get removed or it will add images everywhere
			removePendingGrid: function() {

				var self = this
				//console.log('deleting', self.imgAry)
				for (id in this.imgAry) {
					//delete self.imgAry[id]
					//self.imgAry[id].remove()
					//delete self.imgAry[id]
					//trying it in a settimeout
					//console.log('deleting', self.imgAry[id])
					clearTimeout(self.imgAry[id]);
				}
				//*window.stop() is !important!  It floods the grid view if not set to trigger between page views

			},

			gotoSingle: function(e) {
				var name = this.$(e.currentTarget).data('id')
				window.curModel = this.collection.findWhere({
					name: name
				})
			},

			/**************Grid functions ****************/
			initGridOption: function() {
				var self = this
				/*grid option:
					normal - the default Reddit styling
					small - small thumbnails in the page
					large - full sized images in the page
				*/
				this.gridOption = $.cookie('gridOption');
				if (typeof this.gridOption === 'undefined' || this.gridOption == null || this.gridOption == "") {
					this.gridOption = 'normal'
				} else if (this.gridOption == "large") {
					this.resize()
				}

				this.gridViewSetup()

			},
			gridViewSetup: function() {
				var self = this

				if (this.gridOption == 'grid') {

					$('.side').hide()
					$('#siteTable').css('margin-right', '0') //some custom CSS were making this bad in grid mode
					//calculate how many columns we will have
					var colCount = Math.floor($(document).width() / 301)

					for (var i = 0; i < colCount; i++) {
						self.$('#siteTable').append('<div class="column"> </div>')
					}

					this.$('#siteTable').append('<div id="fullImgCache"></div>')

				} else {

					if (window.settings.get('showSidebar') == false) {
						$('.side').hide()
					} else {
						$('.side').show()
					}
					this.$('#siteTable').html('')
					this.resize()
				}
			},
			shortestCol: function() {
				var shortest = null
				var count = 0
				this.$('.column').each(function() {
					if (shortest == null) {
						shortest = $(this)
					} else if ($(this).height() < shortest.height()) {
						//console.log($(this).height(), shortest.height())
						shortest = $(this)
					}
				});
				return shortest;
			},
			changeSortOrderCss: function() {
				channel.trigger("header:updateSortOrder", this.sortOrder);
			},

			resize: function() {
				var mobileWidth = 1000; //when to change to mobile CSS
				if (this.gridOption == "large") {
					$('.side').hide()
					//change css of 
					var docWidth = $(document).width()
					var newWidth = 0;
					if (docWidth > mobileWidth) {
						newWidth = docWidth - 355;
					} else {
						newWidth = docWidth;
					}
					$('#dynamicWidth ').html(' < style > .large - thumb {width: ' + newWidth + 'px} < /style>');
				}

			},

			changeGridOption: function(data) {
				var self = this
				if (typeof data.gridOption === 'undefined') {
					this.gridOption = $.cookie('gridOption');
				}
				if (this.gridOption == data.gridOption) {
					return;
					//do nothingif the user already clicked this once
				}
				this.removePendingGrid()

				this.gridOption = data.gridOption
				$.cookie('gridOption', this.gridOption, {
					path: '/'
				});

				//this.changeActiveGrid()
				this.resetPosts()

				if (this.name == "large") {
					this.resize()
				}
				this.gridViewSetup()
				this.appendPosts(this.collection)
				this.helpFillUpScreen()
			},
			resetPosts: function() {
				//this.$('#siteTable').html(" ")
				this.$('#siteTable').empty();
			},
			/**************Fetching functions ****************/
			fetchError: function(response, error) {
				console.log("fetch error, lets retry", this.collection)
				if (this.errorRetries < 10) {
					this.loading = false;
					this.showMoarBtn()
				}

				if (this.collection.length <= 5) {
					this.$('#siteTable').html("<div id='retry' >  <img src='img/sad-icon.png' /><br /> click here to try again </div> ")
				}
				this.errorRetries++;

			},
			tryAgain: function() {
				this.$('.loading').hide()
				this.$('#siteTable').html("<div class='loading'></div> ")
				this.$('#retry').remove()

				this.fetchMore();
			},
			fetchMore: function() {
				$(this.el).append("<div class='loading'> </div>")
				this.loading = true
				this.hideMoarBtn()
				this.collection.fetch({
					success: this.gotNewPosts,
					error: this.fetchError,
					remove: false
				});
			},
			appendOne: function(model) {
				console.log('got here omg', model)
				var newPost = $(PostRowGrid({
					model: model.attributes
				}))
				var col = this.shortestCol()
				if (col) {
					col.append(newPost);
				}

			},
			appendPosts: function(collection) {
				var self = this
				this.start = new Date()
				var count = 0;
				var countSelfs = 0

				collection.each(function(model) {

					if (model.get('title') != null) {

						if (this.gridOption == "small") {
							//its faster to just render the template with no view
							this.$('#siteTable').append(PostViewSmallTpl({
								model: model.attributes
							}))
							// var postview = new PostRowView({
							// 	root: "#siteTable",
							// 	id: model.get('id'),
							// 	model: model,
							// 	gridOption: this.gridOption
							// });
						} else if (this.gridOption == 'grid') {

							// if (model.get('thumbnail') != 'undefined') {
							// 	$('#imgCache').append('<img src="' + model.get('thumbnail') + '" />')
							// }

							if (model.get('imgUrl')) {
								count++;
								self.imagesAdded++
								var newPost = $(PostRowGrid({
									model: model.attributes
								}))
								if (count < 11) {

									var col = self.shortestCol()
									if (col) {
										col.append(newPost);
									}
								} else {
									//check if image is cached
									//var img = new Image()
									//img.src = model.get('imgUrl');

									var timeout = count * 310
									self.imgAry[model.get('id')] = setTimeout(function() {

										self.imagesAdded--;
										var col = self.shortestCol()
										if (col) {
											col.append(newPost);
										}
									}, timeout);

								}

							} else {
								countSelfs++;
								//do not add self posts or links
								//var col = self.shortestCol()
								//col.append(newPost);
							}

							//$('<img/>').attr('src', model.get('thumbnail')); //preload thumbnails

						} else if (this.gridOption == "large") {

							var postview = new PostRowView({
								root: "#siteTable",
								id: model.get('id'),
								model: model,
								gridOption: this.gridOption
							});
						} else {

							var postview = new PostRowView({
								root: "#siteTable",
								model: model,
								id: model.get('id'),
								gridOption: this.gridOption
							});
						}
					}
				}, this);

				this.end = new Date()
				console.log('single=', this.end - this.start)
				this.resize()

				if (this.gridOption == 'grid' && count == 0 && countSelfs > 0) {
					//if the grid image finder did not find any images, we need to find some more!
					console.log('found no images, searching for more')
					this.$('.column:first-child').html('<div style="margin:20% 20%;font-size:20px;">no images found, switch views to see self posts and links</div>')

				}

			},
			gotNewPosts: function(models, res) {
				this.$('.loading').hide()

				if (typeof res.data.children.length === 'undefined') {
					return; //we might have an undefined length?
				};
				var newCount = res.data.children.length

				var newModels = new Backbone.Collection(models.slice((models.length - newCount), models.length))
				this.appendPosts(newModels)

				//fetch more  posts with the After
				if (this.collection.after == "stop") {
					console.log("AFTER = stop")
					$(window).off("scroll", this.watchScroll);
				}
				this.loading = false; //turn the flag on to go ahead and fetch more!
				this.showMoarBtn()
				this.helpFillUpScreen()
				window.subs[this.subID] = this.collection

			},

			/**************Infinite Scroll functions ****************/
			watchScroll: function(e) {
				if (window.settings.get('infin') == true) {
					//no longer need this because the setInterval trick combined with window.stop() is good enough to handle a large amount of full sized pictures
					// if (this.imagesAdded > 5) {  
					// 	//console.log('not loading more')
					// 	return;
					// }

					var self = this;
					var triggerPoint = 1500; // 1500px from the bottom     

					//keep the scrollheight in the collection so when we return to it, we can auto-move to it
					//bad?
					this.collection.scroll = $(window).scrollTop()

					if ((($(window).scrollTop() + $(window).height()) + triggerPoint >= $(document).height()) && this.loading == false) {

						console.log('loading MOAR')
						if (this.collection.after != "stop") {
							this.fetchMore()
						}
					}
					//this.prevScrollY = scrollY;
				}
			},
			helpFillUpScreen: function() {

				if (this.collection.length < 301 && (this.gridOption == 'small')) {
					this.watchScroll()
				}

				if (this.collection.length < 55 && this.gridOption == 'grid') {

					this.watchScroll()
				}

			},
			showMoarBtn: function() {
				//var moarBtn = '<p class="nextprev btmCenter"><a href="#" rel="next">MOAR ›</a></p>'
				//this.$el.append(moarBtn)
				this.$('.nextprev').show()
			},
			hideMoarBtn: function() {
				this.$('.nextprev').hide()
			}

		});
		return SubredditView;
	});