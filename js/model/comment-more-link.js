define(['underscore', 'backbone', 'jquery', 'collection/comments'], function(_, Backbone, $, CommentsCollection) {
	var CommentMoreLinkModel = Backbone.Model.extend({
		initialize: function() {
			//this.self = this
			//console.log('comment model INIT', this)

			this.parseThis()

		},
		parseThis: function() {
			console.log("inside of the comment more link model", this)
			var data = this.attributes
			data.kind = 'more'
			//either "more" or "t1"
			if (typeof data.children !== "undefined" && data.children !== "") {
				data.childrenCount = data.children.length
			}
			//data.link_id = this.link_id
			if (data.childrenCount == 1) {
				data.replyVerb = 'reply'
			} else {
				data.replyVerb = 'replies'
			}

			this.attributes = data
		},

	});
	return CommentMoreLinkModel;
});