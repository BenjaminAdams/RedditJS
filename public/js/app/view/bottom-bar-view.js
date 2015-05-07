 define(['App', 'underscore', 'backbone', 'hbs!template/btmbar', 'hbs!template/post-row-small', 'collection/subreddit', 'cView/subreddit', 'view/post-row-view'],
   function(App, _, Backbone, btmbarTmpl, PostViewSmallTpl, SubredditCollection, SrCView, PostRowView) {
     return Backbone.Marionette.LayoutView.extend({
       template: btmbarTmpl,
       regions: {
         'posts': '#bottom-bar'
       },
       ui: {
         bottomBar: "#bottom-bar",
         preloadNextImg: '#preloadNextImg'
       },
       events: {
         'mousemove': 'scrollBottomBar',
         'mouseleave': 'stopScrolling',
         'click .thumbnailSmall': 'gotoSingle'
       },
       initialize: function(options) {
         //_.bindAll(this);
         _.bindAll(this, 'gotNewPosts', 'keyPress')
         var self = this;

         this.subName = options.subName
         this.sortOrder = 'hot'
         this.domain = options.domain
         this.timeFrame = 'month' //added to make this.subID similar to the subreddit subids, bottom bar does not have a timeframe
         if (typeof this.domain === 'undefined') {
           this.domain = null
         }

         this.subID = this.subName + this.domain + this.sortOrder + this.timeFrame
         this.selectedID = false;
         this.pixelsOfOneImg = 97.5

         App.on("bottombar:selected", this.selected, this); //when the user focuses on a single post page
         App.on("btmbar:remove", this.remove, this); //clears everthing in this view
         App.on("btmbar:gotoPrev", this.gotoPrev, this);
         App.on("btmbar:gotoNext", this.gotoNext, this);
         App.on('btmbar:restAndrefetch', this.restAndrefetch, this);
         App.on('btmbar:purgeNonImgAndRerender', this.purgeNonImgAndRerender, this)
         $(window).bind('keydown', this.keyPress); //remove this later!

         this.loading = false; //keeps track if we are loading more posts or not
         this.scrolling = false; //timer for when the users movement over the bottom bar
         this.guessedWidth = 0 //calculated later by how many posts are in the scrollbar

         if (typeof App.subs[this.subID] === 'undefined') {
           this.collection = new SubredditCollection([], {
             domain: this.domain,
             subName: this.subName,
             sortOrder: this.sortOrder,
             removeSiteTableCSS: true
           });

           this.fetchMore();
         }

       },
       onRender: function() {
         var self = this
         App.trigger("single:giveBtnBarID"); //ask the single view to give you the btm bar ID to make active

         if (typeof App.subs[this.subID] !== 'undefined') {
           //console.log('loading collection from memory')
           this.collection = App.subs[this.subID]
         }

         this.subredditCollectionView = new SrCView({
           collection: this.collection,
           childView: PostRowView,
           gridOption: 'small',
           removeSiteTableCSS: true
         })
         this.posts.show(this.subredditCollectionView)
         this.guessedWidth = -(this.collection.length * this.pixelsOfOneImg)

         $('#bottom-bar-container').show()

       },
       onBeforeDestroy: function() {
         $('#bottom-bar-container').hide()

         $(window).unbind('keydown', this.keyPress);
         App.off("btmbar:remove", this.remove, this);
         App.off("bottombar:selected", this.selected, this)
         App.off("btmbar:gotoPrev", this.gotoPrev, this);
         App.off("btmbar:gotoNext", this.gotoNext, this);
         App.off('btmbar:restAndrefetch', this.restAndrefetch, this);
         App.off('btmbar:purgeNonImgAndRerender', this.purgeNonImgAndRerender, this)
         this.deleted = true

         App.fullscreenSlideShow.reset();

       },
       keyPress: function(e) {
         if (this.collection.length > 2) {
           if (e.target.tagName.toLowerCase() !== 'input' && e.target.tagName.toLowerCase() !== 'textarea') {
             if (e.which == 39) //right key
             {
               this.gotoNext()
             } else if (e.which == 37) { //left key
               this.gotoPrev()
             }
           }
         }
       },
       restAndrefetch: function() {
         this.collection.reset()
         this.loading = false
         this.fetchMore()
       },
       purgeNonImgAndRerender: function() {
         this.collection.removeNonImgs()
         this.render()
       },
       getCurrentCollectionIndex: function() {
         if (!this.collection || this.collection.length < 1) {
           return 0
         }

         var selectedModel = this.collection.findWhere({
           name: this.selectedID
         })
         var index = this.collection.indexOf(selectedModel);
         this.shouldWeFetchMore(index)
         return index
       },
       gotoPrev: function() {
         if (!this.collection || this.collection.length < 1) {
           return
         }
         var index = this.getCurrentCollectionIndex()

         var prevModel = this.collection.at(index - 1);
         if (typeof prevModel !== 'undefined') {
           App.curModel = prevModel
           var prevId = prevModel.get('id')
           this.gotoANewPage(this.subName, prevId)
         }
       },
       gotoNext: function() {
         var nextId, nextModel
         if (!this.collection || this.collection.length < 1) {
           return
         }
         var index = this.getCurrentCollectionIndex()

         nextModel = this.collection.at(index + 1);
         if (typeof nextModel !== 'undefined') {
           App.curModel = nextModel
           nextId = nextModel.get('id')
           this.gotoANewPage(this.subName, nextId)
         } else {
           //if we are at the end of the slideshow goto the first post
           nextModel = this.collection.at(0);
           if (!nextModel) return
           App.curModel = nextModel
           nextId = nextModel.get('id')
           this.gotoANewPage(this.subName, nextId)
         }
       },

       preloadNextImg: function() {
         if (!this.collection || this.collection.length < 1) {
           return
         }
         var index = this.getCurrentCollectionIndex()

         var nextModel = this.collection.at(index + 1);
         //if no model found or if the dom is not loaded return
         if (!nextModel || !this.ui || this.ui.preloadNextImg) return

         var nextImg = nextModel.get('imgUrl')
         if (nextImg) {
           this.ui.preloadNextImg.attr('src', nextImg)
         }

       },
       gotoANewPage: function(subName, id) {
         var url = '/r/' + subName + "/comments/" + id + '/x';

         if (App.slideShowActive) {
           url = '/comments/' + this.subName + "/" + App.curModel.get('id') + '/slideshow';
         }

         Backbone.history.navigate(url, {
           trigger: true
         });
       },
       shouldWeFetchMore: function(index) {
         var amountLeft = this.collection.length - index
         if (amountLeft < 8) {
           this.fetchMore()
         }
       },
       //when the user goes to a single post page, that ID will become selected in the bottom bar
       //only trigger this function after we have the entire subreddit data
       markSelected: function() {
         $('.selectedBtmBar').removeClass('selectedBtmBar')
         var selectedThumb = $('.thumbnailSmall#' + this.selectedID)
         selectedThumb.addClass('selectedBtmBar')
         return selectedThumb
       },
       selected: function(name) {
         var self = this
         if (typeof name === 'string') {
           this.selectedID = name
         }

         this.preloadNextImg()

         var selectedThumb = this.markSelected()
         var fakeE = {}
         fakeE.clientX = selectedThumb.offset()
         if (typeof fakeE.clientX !== 'undefined') {
           fakeE.clientX = fakeE.clientX.left + 175
           this.scrollBottomBar(fakeE)

           setTimeout(function() {
             self.stopScrolling()

           }, 1500);

         }

       },

       //only scroll every few milaseconds in an interval
       scrollBottomBar: function(e) {
         var self = this
         if (this.scrolling === false) {
           this.scrolling = true
           clearTimeout(this.userLeftTimeout)

           var currentLeft = this.ui.bottomBar.css('left').replace('px', '')
           var centerScreen = $(document).width() / 2

           if (centerScreen > e.clientX) {
             //if (currentLeft < 0) {
             //only scroll left when not at the start
             //$('#bottom-bar').css('left', '+=10');
             this.setScrollInt('left', '+=5', e.clientX)
               //}
           } else {
             //$('#bottom-bar').css('left', '-=10');
             this.setScrollInt('right', '-=5', e.clientX)
           }

           //toggle transparency only if it does not exist
           if (this.ui.bottomBar.hasClass("transparent")) {
             this.ui.bottomBar.removeClass('transparent')
           }

           setTimeout(function() {
             self.scrolling = false

           }, 35);
         }

       },
       setScrollInt: function(direction, amount, clientX) {
         var self = this
         clearInterval(this.curInterval);
         if (direction == 'stop') {
           return;
         }
         var docWidthMiddle = $(document).width() / 2
         var bounds = docWidthMiddle * 0.65
         var leftThreshold = docWidthMiddle - bounds
         var rightThreshold = docWidthMiddle + bounds
         if ((direction == 'left' && clientX < leftThreshold) || (direction == 'right' && clientX > rightThreshold)) {
           this.curInterval = setInterval(function() {
             var currentLeft = self.ui.bottomBar.css('left').replace('px', '')
             if (direction == 'left' && currentLeft < 0) {
               self.ui.bottomBar.css('left', amount);
             } else if (direction == 'right') {

               if ((self.guessedWidth > currentLeft - 1750) && self.loading === false) {
                 self.fetchMore()
               } else if (self.guessedWidth < currentLeft) {
                 self.ui.bottomBar.css('left', amount);
               }
             }

           }, 10);
         }
       },
       stopScrolling: function() {
         var self = this
         this.setScrollInt('stop')

         this.userLeftTimeout = setTimeout(function() {
           if (self.isDestroyed === false && !self.ui.bottomBar.hasClass("transparent")) {
             self.ui.bottomBar.addClass('transparent')
           }

         }, 1500);

       },
       fetchMore: function(selectAfter) {
         var self = this
         if (this.loading === false) {
           this.showLoading()

           this.loading = true

           setTimeout(function() {

             self.collection.fetch({
               success: self.gotNewPosts,
               remove: false
             }, 500);

           })

         }
       },

       show: function() {
         this.$el.show()
       },
       gotNewPosts: function(models, res) {
         if (typeof res.data.children.length === 'undefined') {
           return; //we might have an undefined length?
         }

         if (App.slideShowActive) {
           this.collection.removeNonImgs()
         }

         //fetch more  posts with the After
         if (this.collection.after == "stop") {
           console.log("AFTER = stop")
           $(window).off("scroll", this.watchScroll);
         }
         this.loading = false; //turn the flag on to go ahead and fetch more!
         this.hideLoading()
         App.subs[this.subID] = this.collection
         this.guessedWidth = -(this.collection.length * this.pixelsOfOneImg)
         this.markSelected()
       },
       gotoSingle: function(e) {
         var name = this.$(e.currentTarget).attr('id')
         App.curModel = this.collection.findWhere({
           name: name
         })

         this.selected(name) //using the router to goto the selected link, pre selecting this post before we travel there
       },
       showLoading: function() {
         // this.ui.bottomBar.append('<img class="btmbar-loading" src="img/loading.gif" />')
         $('#bottom-bar').append('<img class="btmbar-loading" src="img/loading.gif" />')
       },
       hideLoading: function() {
         $('.btmbar-loading').remove()
       }
     });

   });
