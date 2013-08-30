define([
  'underscore', 'backbone', 'resthub', 'hbs!template/subreddit', 'hbs!template/post-row-small', 'view/post-row-view', 'view/sidebar-view', 'view/base-view', 'collection/subreddit', 'event/channel', 'cookie'],
	function(_, Backbone, Resthub, subredditTmpl, PostViewSmallTpl, PostRowView, SidebarView, BaseView, SubredditCollection, channel, Cookie) {
		var SubredditView = BaseView.extend({

			el: $(".content"),
			template: subredditTmpl,

			events: function() {
				var _events = {
					//'click .tabmenu-right li': 'changeGridOption',
					'click #retry': 'tryAgain'

				};
				//console.log('click .upArrow' + this.options.id)
				_events['click .upArrow' + this.options.id] = "upvote";
				_events['click .downArrow' + this.options.id] = "downvote";
				return _events;
			},

			initialize: function(options) {

				this.$('#siteTable').empty()
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

				this.initGridOption();

				this.render();

				$(this.el).prepend("<style id='dynamicWidth'> </style>")
				console.log("window.subs=", window.subs)
				if (typeof window.subs[this.subID] === 'undefined') {
					$(this.el).append("<div class='loading'> </div>")
					this.collection = new SubredditCollection({
						subName: this.subName,
						sortOrder: this.sortOrder
					});
					this.fetchMore();
				} else {
					console.log('loading collection from memory')
					this.collection = window.subs[this.subID]
					this.appendPosts(this.collection)

					//this.fetchMore();
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

			},
			//we have to override the remove event because the window.scroll event will not be removed by the garbage collector
			//cant create infinite scroll without this.
			remove: function() {
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

			/**************Routing functions ****************/
			// clickedInteralLink: function(e) {
			// 	console.log("I clicked a link yo")

			// },
			/**************Grid functions ****************/
			initGridOption: function() {
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
			},
			changeSortOrderCss: function() {
				channel.trigger("header:updateSortOrder", this.sortOrder);
			},

			resize: function() {
				var mobileWidth = 1000; //when to change to mobile CSS
				if (this.gridOption == "large") {
					//change css of 
					var docWidth = $(document).width()
					var newWidth = 0;
					if (docWidth > mobileWidth) {
						newWidth = docWidth - 355;
					} else {
						newWidth = docWidth;
					}
					$('#dynamicWidth').html('<style> .large-thumb { width: ' + newWidth + 'px } </style>');
				}

			},

			changeGridOption: function(data) {
				console.log('changing grid option=', data)
				if (typeof data.gridOption === 'undefined') {
					this.gridOption = $.cookie('gridOption');
				}
				if (this.gridOption == data.gridOption) {
					return; //do nothing if the user already clicked this once
				}
				this.gridOption = data.gridOption
				$.cookie('gridOption', this.gridOption, {
					path: '/'
				});
				//this.changeActiveGrid()
				this.resetPosts()
				if (this.name == "large") {
					this.resize()
				}
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
				}

				if (this.collection.length <= 5) {
					this.$('#siteTable').html("<div id='retry' >  <img src='img/sad-icon.png' /><br /> click here to try again </div> ")
				}
				this.errorRetries++;

			},
			tryAgain: function() {
				this.$('#siteTable').html("<div class='loading'></div> ")
				this.$('#retry').remove()

				this.fetchMore();
			},
			fetchMore: function() {
				this.collection.fetch({
					success: this.gotNewPosts,
					error: this.fetchError,
					remove: false
				});
			},

			appendPosts: function(models) {
				this.start = new Date();
				models.each(function(model) {
					if (model.get('title') != null) {
						if (this.gridOption == "small") {
							// this.$('#siteTable').append(PostViewSmallTpl({
							// 	model: model.attributes
							// }))
							var postview = new PostRowView({
								root: "#siteTable",
								id: model.get('id'),
								model: model,
								gridOption: this.gridOption
							});
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
				this.resize()
				this.end = new Date();;
				console.log("end of subreddit parse=", this.end - this.start)

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
				this.helpFillUpScreen()
				window.subs[this.subID] = this.collection

			},
			/**************Infinite Scroll functions ****************/
			watchScroll: function(e) {
				var self = this;

				var triggerPoint = 1500; // 1500px from the bottom     

				if ((($(window).scrollTop() + $(window).height()) + triggerPoint >= $(document).height()) && this.loading == false) {
					this.loading = true
					console.log('loading MOAR')
					if (this.collection.after != "stop") {
						this.fetchMore()
					}
				}
				//this.prevScrollY = scrollY;
			},
			helpFillUpScreen: function() {
				if (this.collection.length < 301 && this.gridOption == 'small') {
					this.watchScroll()
				}
			}

		});
		return SubredditView;
	});