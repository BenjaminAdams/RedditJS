define(['App', 'backbone', 'jquery', 'view/comment-view', 'collection/comments'],
  function(App, Backbone, $, CommentView, Collection) {
    return Marionette.CollectionView.extend({
      childView: CommentView,
      // collection: Collection,
      initialize: function(options) {
        // _.bindAll(this);
        this.originalPoster = options.originalPoster
        this.commentsDisabled = options.commentsDisabled
        this.collection = options.collection
      },
      childViewOptions: function(model, index) {
        return {
          originalPoster: this.originalPoster,
          commentsDisabled: this.commentsDisabled,
          // $parentEl: this.$el
        }
      },
      _renderChildren: function() {

        // this.collection.each(function(x) {

        //   console.log(x)
        // })

        //commenting out all the features not using
        //this.destroyEmptyView();
        //this.destroyChildren({
        //  checkEmpty: false
        //});

        //if (this.isEmpty(this.collection)) {
        //   this.showEmptyView();
        // } else {
        //this.triggerMethod('before:render:collection', this);
        //this.startBuffering();
        this.showCollection();
        //this.endBuffering();
        //this.triggerMethod('render:collection', this);

        //if (this.children.isEmpty() && this.getOption('filter')) {
        //  this.showEmptyView();
        // }
        //}
      },

      attachHtml: function(collectionView, childView, index) {
        var parentId = childView.model.get('parent_id')

        if (parentId.startsWith('t3_')) {
          //load comment view normally
          collectionView._insertAfter(childView);
        } else {

          var parent = _.findWhere(collectionView.children._views, function(obj) {
            return obj.name === parentId;
          });

          var repliesDiv = parent.$el.find('.replies-' + parentId)
          repliesDiv.append(childView.$el)
        }

        // if (collectionView.isBuffering) {

        //   collectionView._bufferedChildren.splice(index, 0, childView);
        // } else {

        //   if (!collectionView._insertBefore(childView, index)) {
        //     collectionView._insertAfter(childView);
        //   }
        // }
      },

      // showCollection: function() {
      //   var ChildView;
      //   var self = this
      //     //var models = this._filteredSortedModels(); //not filtering/sorting
      //   var models = this.collection.models

      //   _.each(models, function(child, index) {
      //     ChildView = this.getChildView(child);
      //     this.addChild(child, ChildView, index, self);
      //   }, this);
      // },

      // //overriding marionettejs addChild 
      // addChild: function(child, ChildView, index, collectionView) {
      //   var childViewOptions = this.getOption('childViewOptions');
      //   childViewOptions = Marionette._getValue(childViewOptions, this, [child, index]);

      //   var view = this.buildChildView(child, ChildView, childViewOptions);

      //   this._updateIndices(view, true, index);

      //   //this.triggerMethod('before:add:child', view);
      //   this._addChildView(view, index, collectionView);
      //   //this.triggerMethod('add:child', view);

      //   view._parent = this;

      //   return view;
      // },
      // _addChildView: function(view, index, collectionView) {

      //   var canTriggerAttach = this._isShown && !this.isBuffering && Marionette.isNodeAttached(this.el);
      //   var nestedViews;

      //   this.proxyChildEvents(view);

      //   // view.once('render', function() {

      //   //   //if (this._isShown && !this.isBuffering) {
      //   //   // Marionette.triggerMethodOn(view, 'before:show', view);
      //   //   //}

      //   //   if (canTriggerAttach && this._triggerBeforeAttach) {
      //   //     nestedViews = this._getViewAndNested(view);
      //   //     //this._triggerMethodMany(nestedViews, this, 'before:attach');
      //   //   }
      //   // }, this);

      //   this.children.add(view);
      //   this.renderChildView(view, index, collectionView);

      //   if (canTriggerAttach && this._triggerAttach) {
      //     nestedViews = this._getViewAndNested(view);
      //     this._triggerMethodMany(nestedViews, this, 'attach');
      //   }

      //   if (this._isShown && !this.isBuffering) {
      //     Marionette.triggerMethodOn(view, 'show', view);
      //   }
      // },
      // renderChildView: function(view, index, collectionView) {
      //   if (!view.supportsRenderLifecycle) {
      //     Marionette.triggerMethodOn(view, 'before:render', view);
      //   }
      //   view.render();
      //   if (!view.supportsRenderLifecycle) {
      //     Marionette.triggerMethodOn(view, 'render', view);
      //   }
      //   this.attachHtml(collectionView, view, index);
      //   return view;
      // },
      // attachHtml: function(collectionView, childView, index) {

      //   if (collectionView.isBuffering) {

      //     childView = this.findParent(childView)

      //     collectionView._bufferedChildren.splice(index, 0, childView);
      //   } else {

      //     if (!collectionView._insertBefore(childView, index)) {
      //       collectionView._insertAfter(childView);
      //     }
      //   }
      // },
      // attachBuffer: function(collectionView, buffer) {
      //   collectionView.$el.append(buffer);
      // },

      // findParent: function(childView) {
      //   var parentId = childView.model.get('parent_id')

      //   if (parentId.startsWith('t3_')) {
      //     //load comment view normally
      //     return childView
      //   } else {

      //     var parent = _.findWhere(this._bufferedChildren, function(obj) {
      //       return obj.name === parentId;
      //     });

      //     var repliesDiv = parent.$el.find('.replies-' + parentId)
      //     repliesDiv.append(childView.$el)
      //     return childView
      //   }

      // }

    });
  });
