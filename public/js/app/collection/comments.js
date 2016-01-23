define(['backbone', 'model/comment'], function(Backbone, CommentModel) {
    return Backbone.Collection.extend({
        model: CommentModel
    });
});