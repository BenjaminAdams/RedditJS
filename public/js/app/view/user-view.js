define(['App', 'underscore', 'backbone', 'hbs!template/user', 'view/comment-view', 'view/subreddit-view', 'collection/user', 'cView/comments', 'view/post-row-view', 'cookie'],
	function(App, _, Backbone, UserTmpl, CommentView, SubredditView, UserCollection, CView, PostRowView, Cookie) {
		return SubredditView.extend({
			template: UserTmpl,
			events: {
				'click .dropdown-user': 'toggleDropdown'
			},

			initialize: function(options) {
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

				this.collection = new UserCollection([], {
					username: this.username,
					sortOrder: this.sortOrder
				});

				$(window).on("scroll", this.watchScroll);

				this.target = $(window); //the target to test for infinite scroll
				this.loading = false;
				this.scrollOffset = 1000;
				this.prevScrollY = 0; //makes sure you are not checking when the user scrolls upwards
				this.errorRetries = 0; //keeps track of how many errors we will retry after
			},
			onRender: function() {
				this.subredditCollectionView = new CView({
					collection: this.collection,
					itemView: CommentView,
					gridOption: 'normal'
				})
				this.siteTableContainer.show(this.subredditCollectionView)
				this.fetchMore()

				$(this.el).prepend("<style id='dynamicWidth'> </style>")

				$(this.el).append("<div class='loading'> </div>")
				$(window).resize(this.debouncer(function(e) {
					self.resize()
				}));
				this.resize()

			},
			toggleDropdown: function() {
				this.$('.drop-choices-user').toggle()
			},

			gotNewPosts: function(models, res) {
				this.$('.loading').hide()

				if (typeof res.data.children.length === 'undefined') {
					return; //we might have an undefined length?
				}

				//fetch more  posts with the After
				if (this.collection.after == "stop") {
					console.log("AFTER = stop")
					$(window).off("scroll", this.watchScroll);
				}
				this.loading = false; //turn the flag on to go ahead and fetch more!
				this.helpFillUpScreen()

			}

		});

	});