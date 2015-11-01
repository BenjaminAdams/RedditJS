define(['underscore', 'backbone', 'model/comment-more-link'], function(_, Backbone, CommentMoreLinkModel) {

  return function parseComments(data, parentPageLinkID) {
    var self = this
    CommentModel = require('model/comment') //in order to have nested models inside of models we need to do this
    CommentsCollection = require('collection/comments') //in cases of recursion its ok!

    var comments = new CommentsCollection()
    _.each(data.children, function(item) {
      item.data.kind = item.kind
      item.data.link_id = parentPageLinkID
      if (item.kind === "more") {
        var newMoreLink = new CommentMoreLinkModel(item.data)
        comments.add(newMoreLink)
      } else {
        var newComment = new CommentModel(item.data)
        comments.add(newComment)
      }

    });

    return comments
  }

});
