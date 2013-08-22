define([
  'underscore', 'backbone', 'resthub', 'hbs!template/subreddit', 'hbs!template/post-row-small', 'view/post-row-view', 'view/sidebar-view', 'collection/subreddit', 'cookie'],
	function(_, Backbone, Resthub, subredditTmpl, PostViewSmallTpl, PostRowView, SidebarView, SubredditCollection, Cookie) {
		var SubredditView = Resthub.View.extend({

			el: $("#main"),
			template: subredditTmpl,

			events: {
				'click .tabmenu-right li': 'changeGridOption'
			},

			initialize: function(options) {
				_.bindAll(this);
				this.subName = options.subName
				this.collection = new SubredditCollection(this.subName);
				this.template = subredditTmpl;

				this.render();
				this.fetchMore()

				//load sidebar
				this.sidebar = new SidebarView({
					subName: this.subName,
					root: ".side"
				})

				/*grid option:
					normal - the default Reddit styling
					small - small thumbnails in the page
					large - full sized images in the page
				*/
				this.gridOption = $.cookie('gridOption');
				if (this.gridOption == null || this.gridOption == "") {
					this.gridOption = 'normal'
				}
				this.changeActiveGrid() //so we are highlighting the correct grid option on page load

				$(window).on("scroll", this.watchScroll);
				//this.target = $("#siteTable"); //the target to test for infinite scroll
				this.target = $(window); //the target to test for infinite scroll
				this.loading = false;
				this.scrollOffset = 1000;
				this.prevScrollY = 0; //makes sure you are not checking when the user scrolls upwards
				this.errorRetries = 0; //keeps track of how many errors we will retry after
			},

			/**************Grid functions ****************/
			changeActiveGrid: function() {
				this.$('#normal').removeClass('selected');
				this.$('#small').removeClass('selected');
				this.$('#large').removeClass('selected');
				this.$('#' + this.gridOption).addClass('selected');

			},
			changeGridOption: function(e) {
				e.preventDefault()
				e.stopPropagation();
				var target = e.currentTarget
				var name = this.$(target).data('name')
				this.gridOption = name
				$.cookie('gridOption', name)
				this.changeActiveGrid()
				this.resetPosts()
				this.appendPosts(this.collection)
				this.helpFillUpScreen()
			},
			resetPosts: function() {
				this.$('#siteTable').html(" ")
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
						} else if (this.gridOption == "normal") {

							var postview = new PostRowView({
								root: "#siteTable",
								model: model
							});
						}
					}
				}, this);
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