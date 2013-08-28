define([
  'underscore', 'backbone', 'resthub', 'hbs!template/subreddit', 'view/comment-view', 'view/sidebar-view', 'view/subreddit-view', 'collection/user', 'event/channel', 'cookie'],
	function(_, Backbone, Resthub, subredditTmpl, CommentView, SidebarView, SubredditView, UserCollection, channel, Cookie) {
		var UserView = SubredditView.extend({

			el: $(".content"),
			template: subredditTmpl,

			// events: function() {  //hopefully we can only declare events in the subreddit view and inherit them
			// 	var _events = {
			// 		//'click .tabmenu-right li': 'changeGridOption',
			// 		'click #retry': 'tryAgain'

			// 	};
			// 	//console.log('click .upArrow' + this.options.id)
			// 	_events['click .upArrow' + this.options.id] = "upvote";
			// 	_events['click .downArrow' + this.options.id] = "downvote";
			// 	return _events;
			// },

			initialize: function(options) {
				//$(this.el).empty()
				//this.$el.empty()

				_.bindAll(this);
				var self = this;
				this.subName = options.subName
				this.template = subredditTmpl;
				this.sortOrder = options.sortOrder

				if (typeof this.sortOrder === 'undefined') {
					this.sortOrder = 'new'
				}

				channel.on("subreddit:remove", this.remove, this);
				this.dynamicStylesheet("blank") //remove the custom subreddit styles
				this.render();

				$(this.el).prepend("<style id='dynamicWidth'> </style>")

				$(this.el).append("<div class='loading'> </div>")

				this.collection = new UserCollection({
					subName: this.subName,
					sortOrder: this.sortOrder
				});
				this.fetchMore();

				$(window).on("scroll", this.watchScroll);

				this.target = $(window); //the target to test for infinite scroll
				this.loading = false;
				this.scrollOffset = 1000;
				this.prevScrollY = 0; //makes sure you are not checking when the user scrolls upwards
				this.errorRetries = 0; //keeps track of how many errors we will retry after

				$(window).resize(this.debouncer(function(e) {
					self.resize()
				}));
				this.resize()

			},

			/**************Fetching functions ****************/
			appendPosts: function(models) {
				//console.log(models)
				models.each(function(model) {

					var comment = new CommentView({
						model: model,
						id: model.get('id'),
						strategy: "append",
						root: "#siteTable",
					})

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
				//	window.subs[this.subID] = this.collection

			},

		});
		return UserView;
	});