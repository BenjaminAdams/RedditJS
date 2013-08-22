define([
  'underscore', 'backbone', 'resthub', 'hbs!template/subreddit', 'hbs!template/post-row-small', 'view/post-row-view', 'view/sidebar-view', 'collection/subreddit', 'cookie'],
	function(_, Backbone, Resthub, subredditTmpl, PostViewSmallTpl, PostRowView, SidebarView, SubredditCollection, Cookie) {
		var SubredditView = Resthub.View.extend({

			el: $("#main"),
			template: subredditTmpl,

			events: {
				// 'click .mark-all-done': 'toggleAllComplete'
			},

			initialize: function(options) {
				_.bindAll(this);
				this.subName = options.subName
				this.collection = new SubredditCollection(this.subName);
				this.template = subredditTmpl;

				this.render();
				this.fetchMore()

				//window.after = "start"
				//load sidebar
				this.sidebar = new SidebarView({
					subName: this.subName,
					root: ".side"
				})

				//this.collection.fetch({success : this.loaded, headers: {'Cookie':'reddit_session='+cookie} });

				$(window).on("scroll", this.watchScroll);
				this.target = $("#siteTable"); //the target to test for infinite scroll
				this.loading = false;
				this.scrollOffset = 1000;
				this.prevScrollY = 0; //makes sure you are not checking when the user scrolls upwards
				// this.infiniScroll = new Backbone.InfiniScroll(this.collection, {
				// 	success: this.renderPosts,
				// 	scrollOffset: 1000
				// 	//target: "#siteTable",

				// });

			},

			loaded: function(response, posts) {
				this.renderPosts(response)
			},
			fetchError: function(response, error) {
				console.log(response, error)

			},
			fetchMore: function() {
				this.collection.fetch({
					success: this.loaded,
					error: this.fetchError,
					remove: false
				});
			},
			renderPosts: function(models, test) {
				this.$('.loading').hide()

				//console.log(models)

				models.each(function(model) {

					this.$('#siteTable').append(PostViewSmallTpl({
						model: model.attributes
					}))

					//var postview = new PostRowView({
					//	root: "#siteTable",
					//	model: model
					//});
				}, this);

				//fetch more  posts with the After
				if (this.collection.after == "stop") {
					console.log("AFTER = stop")
					//this.infiniScroll.destroy();
					$(window).off("scroll", this.watchScroll);
				}
				this.loading = false; //turn the flag on to go ahead and fetch more!

				if (this.collection.length < 301) {
					console.log('invoking infinite scroll', this.collection.length)
					this.watchScroll()
				}

			},
			watchScroll: function(e) {
				var self = this;

				//prevents multiple loadings of the same post set
				if (this.loading == true) {
					console.log('not loading because loading is true')
					return;
				} else {
					this.loading = true
				}

				var scrollY = this.target.scrollTop() + this.target.height();
				var docHeight = this.target.get(0).scrollHeight;

				if (!docHeight) {
					docHeight = $(document).height();
				}

				if (scrollY >= docHeight - this.scrollOffset && this.prevScrollY <= scrollY) {

					if (this.collection.after != "stop") {
						this.fetchMore()
					}
				}
				this.prevScrollY = scrollY;
			}

		});
		return SubredditView;
	});