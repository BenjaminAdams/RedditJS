define([
  'underscore', 'backbone', 'resthub', 'hbs!template/comments', 'event/channel', 'cookie'],
	function(_, Backbone, Resthub, commentsTmpl, channel, Cookie) {
		var CommentsView = Resthub.View.extend({

		// id: "commentarea",
		// tagName: 'div',
			template: commentsTmpl,

			events: {
				//'click .tabmenu-right li': 'changeGridOption'
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