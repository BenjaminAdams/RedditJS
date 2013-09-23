define(['underscore', 'backbone', 'jquery', 'model/comment-more-link', 'model/comment', 'collection/comments'], function(_, Backbone, $, CommentMoreLinkModel, CommentModel, CommentsCollection) {
	var Base = Backbone.Model.extend({

		parseComments: function(data, parentPageLinkID) {

			CommentModel = require('model/comment') //in order to have nested models inside of models we need to do this
			CommentsCollection = require('collection/comments') //in cases of recursion its ok!

			var comments = new CommentsCollection()
			_.each(data.children, function(item) {
				// do stuff
				item.data.kind = item.kind
				item.data.link_id = parentPageLinkID
				if (item.kind == "more") {
					var newMoreLink = new CommentMoreLinkModel(item.data)
					comments.add(newMoreLink)
				} else {
					//console.log("THIS IS A T1", item)
					var newComment = new CommentModel(item.data)
					comments.add(newComment)
				}

			});

			return comments
		}

	});
	return Base;
});