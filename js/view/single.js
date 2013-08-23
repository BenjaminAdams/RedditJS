define([
  'underscore', 'backbone', 'resthub', 'hbs!template/single', 'view/post-row-view', 'view/sidebar-view', 'model/single', 'event/channel', 'cookie'],
	function(_, Backbone, Resthub, singleTmpl, PostRowView, SidebarView, channel, SingleModel, Cookie) {
		var SingleView = Resthub.View.extend({

			el: $("#main"),
			template: singleTmpl,

			events: {
				//'click .tabmenu-right li': 'changeGridOption'
			},

			initialize: function(options) {
				_.bindAll(this);
				var self = this;
				this.subName = options.subName
				this.id = options.id

				this.model = new SubredditCollection({
					subName: this.subName,
					sortOrder: this.sortOrder
				});
				this.template = subredditTmpl;

				this.render();

				//load sidebar
				this.sidebar = new SidebarView({
					subName: this.subName,
					root: ".side"
				})

			},

			/**************Grid functions ****************/
			changeActiveGrid: function() {
				this.$('#normal').removeClass('selected');
				this.$('#small').removeClass('selected');
				this.$('#large').removeClass('selected');
				this.$('#' + this.gridOption).addClass('selected');

			},
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
			//in our full image homepage view aka"large", we have 3 columns
			//this function calculates which col is the least height so we can then add the image to that column
			determineCol: function() {

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
		return SingleView;
	});