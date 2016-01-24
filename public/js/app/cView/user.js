define(['App', 'marionette', 'view/comment-view', 'view/post-row-view'],
  function(App, Marionette, CommentView, PostView) {
    return Backbone.Marionette.CollectionView.extend({
      id: 'siteTable',
      className: 'sitetable linklisting',
      //because the users view can contain both posts and comments we can reuse each view for them
      getChildView: function(model) {
        if (model.get("kind") === 't1') {
          return CommentView;
        } else {
          return PostView;
        }

      },

    });
  });
