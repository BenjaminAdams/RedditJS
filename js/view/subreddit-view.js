define([
  'underscore', 'backbone', 'resthub', 'hbs!template/subreddit', 'hbs!template/post-row-small', 'view/post-row-view', 'view/sidebar-view', 'collection/subreddit', 'infinite-scroll', 'cookie'],
	function(_, Backbone, Resthub, subredditTmpl, PostViewSmallTpl, PostRowView, SidebarView, SubredditCollection, InfiniteScroll, Cookie) {
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
				window.after = "start"
				//load sidebar
				this.sidebar = new SidebarView({
					subName: this.subName,
					root: ".side"
				})

				//this.collection.fetch({success : this.loaded, headers: {'Cookie':'reddit_session='+cookie} });
				this.collection.fetch({
					success: this.loaded,
					error: this.fetchError
				});

				this.infiniScroll = new Backbone.InfiniScroll(this.collection, {
					success: this.renderPosts,
					scrollOffset: 1000
					//target: "#siteTable",

				});

			},

			loaded: function(response, posts) {
				this.renderPosts(response)
			},
			fetchError: function(response, error) {
				console.log(response, error)

			},
			renderPosts: function(models) {
				this.$('.loading').hide()

				models.each(function(model) {

					this.$('#siteTable').append(PostViewSmallTpl({
						model: model.attributes
					}))

					//var postview = new PostRowView({
					//	root: "#siteTable",
					//	model: model
					//});
				}, this);

				this.collection.add([models])
				//console.log(models)
				//console.log(this.collection)

				window.after = this.collection.after

				if (this.collection.length < 401) {
					console.log('invoking infinite scroll', this.collection.length)
					this.infiniScroll.watchScroll()
				}

				//fetch more  posts with the After
				if (this.collection.after == "stop") {
					console.log("AFTER = stop")
					this.infiniScroll.destroy();
				}

			},

		});
		return SubredditView;
	});