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
        this.isBuffering = false;
        this.showCollection();
      },
      _onCollectionAdd: function(child, collection, opts) {

        var index = opts.at !== undefined && (opts.index || collection.indexOf(child));

        if (this.getOption('filter') || index === false) {
          index = _.indexOf(this._filteredSortedModels(index), child);
        }

        if (this._shouldAddChild(child, index)) {
          this.destroyEmptyView();
          var ChildView = this.getChildView(child);
          this.addChild(child, ChildView, index);
        }
      },
      showCollection: function() {
        this.addAry(this.collection.models)
      },
      addAry: function(models) {
        var self = this
        _.each(models, function(child, index) {
          var childViewOptions = self.getOption('childViewOptions');
          childViewOptions = Marionette._getValue(childViewOptions, self, [child, index]);

          var view = self.buildChildView(child, self.childView, childViewOptions);
          view._parent = this
          this.children.add(view);
          this.renderChildView(view, index);
        }, this);

      },
      attachHtml: function(collectionView, childView) {

        var parentId = childView.model.get('parent_id')
        if (parentId && parentId.startsWith('t3_')) {
          //load comment view normally
          this.$el.append(childView.$el);
        } else {
          //render child comment inside of parent view
          var parent = _.findWhere(collectionView.children._views, function(obj) {
            return obj.name === parentId;
          });

          if (!parent || !parent.ui) {
            console.log('couldnt get parent')
          }

          if (childView._firstRender === true) {
            childView.render()
          }

          //parent.ui.replies.append(childView.el) //this is the way I want to do it

          var repliesDiv = this.$el.find('.replies-' + parentId) //looks like I have to do it this way for now :(
          repliesDiv.append(childView.el)

          // var repliesDiv = parent.$el.find('.replies-' + parentId)
          //if(!repliesDiv) {
          //	  console.log('could find repliesdiv',repliesDiv)
          //}
          // repliesDiv.el.append(childView.el)
        }

      },

      renderChildView: function(view, index) {
        view.render();
        this.attachHtml(this, view, index);
      },

    });
  });
