define(['App', 'backbone', 'jquery', 'view/comment-view'],
	function(App, Backbone, $, CommentView) {
		//  return Backbone.Marionette.FasterCollectionView.extend({
		return Marionette.CollectionView.extend({
			itemView: CommentView,
			initialize: function(options) {
				// _.bindAll(this);
				this.originalPoster = options.originalPoster
			},
			itemViewOptions: function(model, index) {
				var self = this
				return {
					originalPoster: this.originalPoster
				}
			}

		});
	});