define([
  'underscore', 'backbone', 'resthub', 'hbs!template/comments', 'view/comment-view', 'hbs!template/comment', 'view/base-view', 'collection/comments', 'model/comment', 'event/channel', 'cookie'],
	function(_, Backbone, Resthub, commentsTmpl, CommentView, commentTmpl, BaseView, CommentCollection, CommentModel, channel, Cookie) {
		var CommentsView = BaseView.extend({

			template: commentsTmpl,

			events: function() {
				var _events = {
					//'click .noncollapsed .expand': "hideThread",
					'click .upArrow': "upvoteComment",
					'click .downArrow': "downvoteComment"
				};
				_events['submit #comment' + this.options.model.get('name')] = "comment";

				return _events;
			},

			initialize: function(options) {
				//console.log('comments view in it')
				_.bindAll(this);
				$(this.el).html('')
				var self = this;
				this.template = commentsTmpl;

				this.collection = options.collection
				this.render();
				this.renderComments(this.collection, '#commentarea')
				this.model = options.model
				//console.log('init comments view model=', this.model)

			},
			upvoteComment: function(e) {
				e.preventDefault()
				e.stopPropagation()

				var target = this.$(e.currentTarget)
				console.log('upvoting', target)
				var id = target.parent().parent().attr('id');

				var likes = this.$(".upArrow" + id).hasClass('upmod')
				console.log(".upArrow" + id, likes)
				if (likes == false) {
					this.vote(1, "t1_" + id)

					this.$('.midcol' + id).removeClass('dislikes unvoted').addClass('likes')

					this.$('.upArrow' + id).addClass('upmod')
					this.$('.upArrow' + id).removeClass('up')
					this.$('.downArrow' + id).addClass('down')
					this.$('.downArrow' + id).removeClass('downmod')

				} else {
					this.cancelVoteComment(id)
				}
			},
			cancelVoteComment: function(id) {
				this.vote(0, "t1_" + id)

				this.$('.midcol' + id).removeClass('dislikes likes').addClass('unvoted')

				this.$('.upArrow' + id).addClass('up')
				this.$('.upArrow' + id).removeClass('upmod')
				this.$('.downArrow' + id).addClass('down')
				this.$('.downArrow' + id).removeClass('downmod')

			},
			downvoteComment: function(e) {
				e.preventDefault()
				e.stopPropagation()

				var target = this.$(e.currentTarget)
				console.log('downvoting', target)
				var id = target.parent().parent().attr('id');

				var dislikes = this.$(".downArrow" + id).hasClass('downmod')
				console.log(".downArrow" + id, dislikes)
				if (dislikes == false) {
					this.vote(-1, "t1_" + id)

					this.$('.midcol' + id).removeClass('likes unvoted').addClass('dislikes')

					this.$('.upArrow' + id).addClass('up')
					this.$('.upArrow' + id).removeClass('upmod')
					this.$('.downArrow' + id).addClass('downmod')
					this.$('.downArrow' + id).removeClass('down')

				} else {
					this.cancelVoteComment(id)
				}
			},
			renderComments: function(collection, selector) {
				var self = this;
				collection.each(function(model) {
					//console.log('model in renderComments', model)
					// var comment = new CommentView({
					// 	model: model,
					// 	id: model.get('id'),
					// 	strategy: "append",
					// 	root: "#siteTableComments"
					// 	//root: "#commentarea"
					// })
					this.$(selector).append(commentTmpl({
						model: model.attributes
					}))
					var replies = model.get('replies')
					if (typeof replies !== 'undefined' && replies != "" && replies != null) {
						self.renderComments(replies, '#' + model.get('name'))
					}

				})
			},

			/**************Fetching functions ****************/
			fetchError: function(response, error) {
				console.log("fetch error, lets retry")

			},
			fetchMore: function() {

			},

			//called when no model is passed and after the fetch happens
			loaded: function(model, res) {
				this.$('.loading').hide()

				this.render();

			},

		});
		return CommentsView;
	});