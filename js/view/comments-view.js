define([
  'underscore', 'backbone', 'resthub', 'hbs!template/comments', 'view/base-view', 'event/channel', 'cookie'],
	function(_, Backbone, Resthub, commentsTmpl, BaseView, channel, Cookie) {
		var CommentsView = BaseView.extend({

			template: commentsTmpl,

			events: {
				'click .upArrow': 'upvote',
				'click .downArrow': 'downvote',
				//  'keyup #new-todo':     'showTooltip'
			},

			initialize: function(options) {
				_.bindAll(this);

				$(this.el).html('')

				var self = this;
				this.collection = options.collection

				this.template = commentsTmpl;

				this.render();
				// this.model.fetch({
				// 	success: this.loaded,
				// 	error: this.fetchError
				// });

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