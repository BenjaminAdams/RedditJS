define(['App', 'backbone', 'jquery', 'view/comment-view', 'collection/comments'],
  function(App, Backbone, $, CommentView, Collection) {
    return Marionette.CollectionView.extend({
      childView: CommentView,
      initialize: function(options) {
        this.originalPoster = options.originalPoster
        this.commentsDisabled = options.commentsDisabled
        this.collection = options.collection
        this.mainPostId = options.mainPostId
      },
      childViewOptions: function(model, index) {
        return {
          originalPoster: this.originalPoster,
          commentsDisabled: this.commentsDisabled,
          mainPostId: this.mainPostId
        }
      },
      //I've hacked the CollectionView to render recursively nested comments
      _renderChildren: function() {
        this.destroyEmptyView();
        this.destroyChildren({
          checkEmpty: false
        });
        this.showCollection();
      },
      showCollection: function() {
        var self = this
        var models = this.collection.models;

        _.each(models, function(child, index) {
          var childViewOptions = self.getOption('childViewOptions');
          childViewOptions = Marionette._getValue(childViewOptions, self, [child, index]);

          var view = self.buildChildView(child, self.childView, childViewOptions);
          view._parent = this
          this.children.add(view);
          this.renderChildView(view, index);
        }, this);
      },
      attachHtml: function(collectionView, childView, index) {

        var parentId = childView.model.get('parent_id')
        if (parentId && parentId.startsWith('t3_')) {
          //load comment view normally
          this.$el.append(childView.el);
        } else {
          //render child comment inside of parent view
          var parent = _.findWhere(collectionView.children._views, function(obj) {
            return obj.name === parentId;
          });

          var repliesDiv = parent.$el.find('.replies-' + parentId)
          repliesDiv.append(childView.$el)
        }

      },

      renderChildView: function(view, index) {
        view.render();
        this.attachHtml(this, view, index);
        return view;
      },

    });
  });
