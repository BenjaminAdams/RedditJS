define([
  'underscore', 'backbone', 'resthub', 'hbs!template/subreddit', 'hbs!template/post-row-small', 'view/post-row-view', 'view/sidebar-view', 'collection/subreddit', 'event/channel', 'cookie'],
	function(_, Backbone, Resthub, subredditTmpl, PostViewSmallTpl, PostRowView, SidebarView, SubredditCollection, channel, Cookie) {
		var SubredditView = Resthub.View.extend({

			el: $("#main"),
			template: subredditTmpl,

			events: {
				'click .tabmenu-right li': 'changeGridOption',
				// 'click a .thing': "clickedInteralLink"
			},

			initialize: function(options) {
				_.bindAll(this);
				var self = this;
				this.subName = options.subName
				this.sortOrder = options.sortOrder
				this.collection = new SubredditCollection({
					subName: this.subName,
					sortOrder: this.sortOrder
				});
				this.template = subredditTmpl;

				this.render();
				this.fetchMore();

				//load sidebar
				this.sidebar = new SidebarView({
					subName: this.subName,

					//root: ".side"
				})

				/*grid option:
					normal - the default Reddit styling
					small - small thumbnails in the page
					large - full sized images in the page
				*/
				this.gridOption = $.cookie('gridOption');
				console.log("page is loading and grid option=", this.gridOption)
				if (this.gridOption == null || this.gridOption == "") {
					this.gridOption = 'normal'
				} else if (this.gridOption == "large") {
					this.resize()

				}
				this.changeActiveGrid() //so we are highlighting the correct grid option on page load

				$(window).on("scroll", this.watchScroll);
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

			},
			/**************Routing functions ****************/
			// clickedInteralLink: function(e) {
			// 	console.log("I clicked a link yo")

			// },
			/**************Grid functions ****************/
			changeActiveGrid: function() {
				this.$('#normal').removeClass('selected');
				this.$('#small').removeClass('selected');
				this.$('#large').removeClass('selected');
				this.$('#' + this.gridOption).addClass('selected');

			},
			//so we resize it does not do a resize for every pixel the user resizes
			//it has a timeout that fires after the user is done resizing
			debouncer: function(func, timeout) {
				var timeoutID, timeout = timeout || 20;
				return function() {
					var scope = this,
						args = arguments;
					clearTimeout(timeoutID);
					timeoutID = setTimeout(function() {
						func.apply(scope, Array.prototype.slice.call(args));
					}, timeout);
				}
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
					$('#dnamicWidth').html('<style> .large-thumb { width: ' + newWidth + 'px } </style>');
				}

			},

			changeGridOption: function(e) {
				e.preventDefault()
				e.stopPropagation();
				var target = e.currentTarget
				var name = this.$(target).data('name')
				if (this.gridOption == name) {
					return; //do nothing if the user already clicked this once
				}
				this.gridOption = name
				$.cookie('gridOption', name, {
					path: '/'
				});
				this.changeActiveGrid()
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
				console.log("fetch error, lets retry")
				if (this.errorRetries < 10) {
					this.loading = false;
				}
				this.errorRetries++;

			},
			fetchMore: function() {
				this.collection.fetch({
					success: this.gotNewPosts,
					error: this.fetchError,
					remove: false
				});
			},

			appendPosts: function(models) {
				console.log(models)
				models.each(function(model) {
					if (model.get('title') != null) {
						if (this.gridOption == "small") {
							this.$('#siteTable').append(PostViewSmallTpl({
								model: model.attributes
							}))
						} else if (this.gridOption == "large") {

							var postview = new PostRowView({
								root: "#siteTable",
								model: model,
								gridOption: this.gridOption
							});
						} else {

							var postview = new PostRowView({
								root: "#siteTable",
								model: model,
								gridOption: this.gridOption
							});
						}
					}
				}, this);
				this.resize()
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