define(['App', 'jquery', 'underscore', 'backbone', 'view/basem-view', 'hbs!template/post-row-grid', 'hbs!template/blank'],
  function(App, $, _, Backbone, BaseView, PostRowGridTmpl, BlankTmpl) {
    return BaseView.extend({
      //template: PostRowGridTmpl,
      template: BlankTmpl, //we generate the html for this view after we have the image loaded
      events: {
        'click a': "gotoSingle",
        'click .upArrow': 'upvote',
        'click .downArrow': 'downvote',
        'click .save': 'savePost',
        'click .unsave': 'unSavePost',
        'click .hide': 'hidePost',
        'click .report': 'reportShow',
        'click .reportConfirmYes': 'reportYes',
        'click .reportConfirmNo': 'reportShow',
        'click .share-button': 'toggleShare'
      },
      ui: {
        'gridLoading': '.gridLoading',
        'mainGridImg': '.mainGridImg',
        'upArrow': '.upArrow',
        'downArrow': '.downArrow',
        'midcol': '.midcol',
        'flatList': '.flat-list',
        'reportConfirm': '.reportConfirm',
        'reportConfirmYes': '.reportConfirmYes',
        'save': '.save',
        'unsave': '.unsave'
      },
      initialize: function(options) {
        var self = this
        _.bindAll('this.preloadImg');
        this.model = options.model;
        this.biggerImg = this.model.get('imgUrl')
        this.smallerImg = this.model.get('smallImg')
        this.viewClosed = false //need a way to prevent the image to preload if the view is destroy
          //this.attempts = 0 //how many times we attempt to render the view
        this.allowedToRender = false
        this.nonImg = false
        this.cols = options.cols
        this.forceNonImgToRender = false
        if (this.biggerImg) { //don't preload/check for loading if the grid block does not have an img
          this.preloadImg()
        } else {
          this.allowedToRender = true
          this.biggerImg = ''
          this.nonImg = true
        }

        this.listenTo(App, 'showNonImgs', this.triggerNonImgShow, this)

      },
      render: function() {
        var self = this

        //if (!this.biggerImg || !this.allowedToRender || this.viewClosed === true) {
        if (!this.allowedToRender || this.viewClosed === true) {
          return false //so we dont render non image posts
        }

        if (App.settings.get('displaySelf') === true && !this.biggerImg) {
          //return false
        }

        //console.log('rendering grid block')
        this.$el.html($(PostRowGridTmpl({
          model: this.model.attributes
        })))

        this.$el.hide()

        if (this.biggerImg.split('.').pop() == 'gif') {
          this.$el.find('.gridLoading').show()
            //newPost.find('.gridLoading').show() //only show loading icon if its a gif
        }

        if (this.smallerImg !== false && this.nonImg === false) { //only need to hover over img when we have bigger img available

          var timer;
          this.$el.on("mouseenter", function() {
            //set a timer so dont load a bunch of high res images fast
            timer = setTimeout(function() {
              console.log('mouseenter')
              if (self.biggerImg.split('.').pop() == 'gif') {
                self.ui.gridLoading.attr('src', '/img/loading.gif')
              }

              $('<img src="' + self.biggerImg + '" />').load(function() {
                self.ui.mainGridImg.attr('src', self.biggerImg);
                self.ui.gridLoading.hide()
              }).error(function() {
                console.log("ERROR loading img")
                self.ui.gridLoading.hide() //hide loading gif
                  //TODO show a failed to load img
              });
            }, 250);
          }).mouseleave(function() {
            //clear timer if they only hovered for a bit
            clearTimeout(timer);
          })

        }

        if (this.nonImg) {
          setTimeout(function() {
            self.fakeRender()
          }, 1)
        } else {
          this.fakeRender()
        }

        return this

      },
      fakeRender: function() {
        this.bindUIElements();
        this.appendToShortest(this.el)

        if (this.nonImg === false || App.settings.get('hideSelf') === false) {
          this.$el.show()
        } else {
          this.$el.hide()
        }

      },
      triggerNonImgShow: function() {
        this.$el.show()
      },
      //onRender: function() {  //functions like onRender() wont work when we override the render() function like here
      //},
      onBeforeDestroy: function() {
        this.viewClosed = true

        this.$el.off("mouseenter")

      },
      preloadImg: function() {
        var self = this

        if (this.viewClosed === true || this.imgHasLoaded === true) {
          console.log('trying to preload a grid block that has been destroy')
          return
        }

        var imgToPreload = this.smallerImg || this.biggerImg
        if (App.gridImagesLoadingCount < 10) {
          //only attempt to load 10 images at once
          App.gridImagesLoadingCount++;
          App.off("gridView:imageLoaded", this.preloadImg)

          $('<img />').attr('src', imgToPreload).load(function() {
            self.allowedToRender = true
            self.imgHasLoaded = true
            self.render()
            App.gridImagesLoadingCount--;
            App.trigger("gridView:imageLoaded")
          }).error(function() {
            App.gridImagesLoadingCount--;
          })

        } else if (this.allowedToRender === false) {
          App.once("gridView:imageLoaded", this.preloadImg, this);
        }
      },

      //when the user hovers over a grid block image load the gif/bigger img from imgur
      loadBiggerImg: function() {
        var self = this

        if (biggerImg.split('.').pop() == 'gif') {
          self.ui.gridLoading.attr('src', '/img/loading.gif')
            //newPost.find('.gridLoading').show() //only show loading icon if its a gif
        }

        $('<img src="' + biggerImg + '" />').load(function() {
          self.find('img').attr('src', biggerImg);
          self.find('.gridLoading').hide() //hide loading gif
        }).error(function() {

          self.find('.gridLoading').hide() //hide loading gif
            //TODO show a failed to load img
        });

      },
      shortestCol: function() {
        var shortest = null
        var count = 0

        _.each(this.cols, function(x) {
          if (shortest === null) {
            shortest = x
          } else if (x.clientHeight < shortest.clientHeight) {
            shortest = x
          }
        })

        return shortest;
      },
      appendToShortest: function(newPost) {
        var col = this.shortestCol()
        col.appendChild(newPost);
      }

    });
  });
