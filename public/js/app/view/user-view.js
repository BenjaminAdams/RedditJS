define([
		'underscore', 'backbone', 'resthub', 'hbs!template/user', 'view/comment-view', 'view/subreddit-view', 'collection/user', 'event/channel', 'cookie'
	],
	function(_, Backbone, Resthub, UserTmpl, CommentView, SubredditView, UserCollection, channel, Cookie) {
		var UserView = SubredditView.extend({

			el: $(".content"),
			events: {
				'click .dropdown-user': 'toggleDropdown'
			},

			initialize: function(options) {
				//$(this.el).empty()
				//this.$el.empty()
				console.log('options=', options)
				_.bindAll(this);
				var self = this;
				this.username = options.username
				this.sortOrder = options.sortOrder

				if (typeof this.sortOrder === 'undefined') {
					this.sortOrder = 'new'
				}

				//this model is to pass data into the template
				this.model = new Backbone.Model({
					username: this.username,
					sortOrder: this.sortOrder
				})
				this.template = UserTmpl

				channel.on("subreddit:remove", this.remove, this);
				this.render();

				$(this.el).prepend("<style id='dynamicWidth'> </style>")

				$(this.el).append("<div class='loading'> </div>")

				this.collection = new UserCollection({
					username: this.username,
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
			toggleDropdown: function() {
				this.$('.drop-choices-user').toggle()
			},

			/**************Fetching functions ****************/
			appendPosts: function(models) {
				console.log('userposts=', models)
				models.each(function(model) {

					var comment = new CommentView({
						model: model,
						id: model.get('id'),
						strategy: "append",
						root: "#siteTable"
					})

				}, this);

				this.resize()

			},
			gotNewPosts: function(models, res) {
				this.$('.loading').hide()

				if (typeof res.data.children.length === 'undefined') {
					return; //we might have an undefined length?
				}
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

			}

		});
		return UserView;
	});