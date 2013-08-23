define([
  'underscore', 'backbone', 'resthub', 'hbs!template/comments', 'view/comment-view', 'view/base-view', 'event/channel', 'cookie'],
	function(_, Backbone, Resthub, commentsTmpl, CommentView, BaseView, channel, Cookie) {
		var CommentsView = BaseView.extend({

			template: commentsTmpl,

			events: {
				//'click .upArrow': 'upvote',
				//'click .downArrow': 'downvote',
				//  'keyup #new-todo':     'showTooltip'
			},

			initialize: function(options) {
				_.bindAll(this);
				$(this.el).html('')
				var self = this;
				this.collection = options.collection
				this.template = commentsTmpl;
				this.render();

				this.renderComments(this.collection)

				// this.model.fetch({
				// 	success: this.loaded,
				// 	error: this.fetchError
				// });

			},
			renderComments: function(collection) {
				//console.log(collection)
				collection.each(function(model) {
					//console.log(model.get('id'))
					var comment = new CommentView({
						model: model,
						id: model.get('id'),
						root: "#siteTableComments"
						//root: "#commentarea"
					})

				})
			},

			/**************Fetching functions ****************/
			fetchError: function(response, error) {
				console.log("fetch error, lets retry")

			},
			fetchMore: function() {

			},

			loaded: function(model, res) {
				this.$('.loading').hide()

				this.render();

			},

		});
		return CommentsView;
	});