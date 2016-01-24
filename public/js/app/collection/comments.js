define(['backbone', 'model/comment'], function(Backbone, CommentModel) {
  return Backbone.Collection.extend({
    model: CommentModel,
    initialize: function(models, options) {
      _.bindAll(this);
      this.name = options.name //this is maybe the parentId name
    },
    parse: function(data) {
      if (!data || !data.children || data.children.length === 0) return []
      var allTheComments = []

      //if the parent_id is t1 its parent is comment
      //if the parent_id is a t3 the parent is a root comment of the reddit post

      if (data.children) {

        Array.prototype.push.apply(allTheComments, this.addComments(data.children));
      }

      return allTheComments
    },
    addComments: function(children) {
      var self = this
      var allTheComments = []
      _.each(children, function(x) {

        //x.data.kind = x.kind
        allTheComments.push(x)
        if (_.has(x, 'data.replies.data.children')) {
          Array.prototype.push.apply(allTheComments, self.addComments(x.data.replies.data.children));
        }
      })
      return allTheComments
    }
  });
});
