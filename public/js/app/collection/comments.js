define(['backbone', 'model/comment', 'model/comment-more-link'], function(Backbone, CommentModel, CommentMoreLinkModel) {
    var CommentsCollection = Backbone.Collection.extend({
        //model: CommentModel,
        initialize: function(options) {
            //this.link_id = options.link_id
            //console.log('init comments COLLECTION,', options)
            //this.parseJson()
        }

    });
    return CommentsCollection;
});