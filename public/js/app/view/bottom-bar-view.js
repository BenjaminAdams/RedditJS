 define(['App', 'underscore', 'backbone', 'hbs!template/btmbar', 'hbs!template/post-row-small', 'collection/subreddit', 'cView/subreddit', 'view/post-row-view'],
     function(App, _, Backbone, btmbarTmpl, PostViewSmallTpl, SubredditCollection, SrCView, PostRowView) {
         return Backbone.Marionette.Layout.extend({

             //   el: $("#bottom-bar"),
             template: btmbarTmpl,
             regions: {
                 'posts': '#bottom-bar'
             },
             ui: {
                 bottomBar: "#bottom-bar"
             },
             events: {
                 'mousemove': 'scrollBottomBar',
                 'mouseleave': 'stopScrolling',
                 'click .thumbnailSmall': 'gotoSingle'
                 //'click .tabmenu-right li': 'changeGridOption',
                 //'click #retry': 'tryAgain',
                 //'click .thumbnailSmall': 'gotoSingle'

             },

             initialize: function(options) {
                 _.bindAll(this);
                 var self = this;

                 this.subName = options.subName
                 this.sortOrder = 'hot'
                 this.domain = options.domain
                 if (typeof this.domain === 'undefined') {
                     this.domain = null
                 }
                 this.subID = this.subName + this.domain + this.sortOrder
                 this.selectedID = false;
                 this.pixelsOfOneImg = 97.5

                 App.on("bottombar:selected", this.selected, this); //when the user focuses on a single post page
                 App.on("btmbar:remove", this.remove, this); //clears everthing in this view
                 App.on("btmbar:gotoPrev", this.gotoPrev, this);
                 App.on("btmbar:gotoNext", this.gotoNext, this);
                 $(window).bind('keydown', this.keyPress); //remove this later!

                 this.loading = false; //keeps track if we are loading more posts or not
                 this.scrolling = false; //timer for when the users movement over the bottom bar
                 this.guessedWidth = 0 //calculated later by how many posts are in the scrollbar

                 if (typeof window.subs[this.subID] === 'undefined') {
                     this.collection = new SubredditCollection([], {
                         domain: this.domain,
                         subName: this.subName,
                         sortOrder: this.sortOrder
                     });

                     this.fetchMore();
                 }

             },
             onRender: function() {
                 var self = this
                 //$('#bottom-bar').show()
                 App.trigger("single:giveBtnBarID"); //ask the single view to give you the btm bar ID to make active

                 if (typeof window.subs[this.subID] !== 'undefined') {
                     console.log('loading collection from memory')
                     this.collection = window.subs[this.subID]
                     //   this.appendPosts(this.collection)
                     // this.selected(this.selectedID)
                 }

                 this.subredditCollectionView = new SrCView({
                     collection: this.collection,
                     itemView: PostRowView,
                     gridOption: 'small'
                 })
                 this.posts.show(this.subredditCollectionView)
                 this.guessedWidth = -(this.collection.length * this.pixelsOfOneImg)

                 //setTimeout(function() {
                 //self.selected()
                 //}, 5000)

             },
             onBeforeClose: function() {
                 // $('#bottom-bar').hide()
                 $(window).unbind('keydown', this.keyPress);
                 App.off("btmbar:remove", this.remove, this);
                 App.off("bottombar:selected", this.selected, this)
                 App.off("btmbar:gotoPrev", this.gotoPrev, this);
                 App.off("btmbar:gotoNext", this.gotoNext, this);
                 this.deleted = true

                 //Backbone.View.prototype.remove.call(this);
                 console.log('********removed the btm bar **')

                 //call the superclass remove method
                 //Backbone.View.prototype.remove.apply(this, arguments);
             },
             keyPress: function(e) {
                 //console.log('keydown', e.which)
                 if (this.collection.length > 2) {
                     if (e.target.tagName.toLowerCase() !== 'input' && e.target.tagName.toLowerCase() !== 'textarea') {

                         //find the selected model

                         if (e.which == 39) //right key
                         {
                             this.gotoNext()
                         } else if (e.which == 37) { //left key
                             this.gotoPrev()

                         }
                     }
                 }
             },
             gotoPrev: function() {
                 var selectedModel = this.collection.findWhere({
                     name: this.selectedID
                 })
                 var index = this.collection.indexOf(selectedModel);
                 this.shouldWeFetchMore(index)
                 var prevModel = this.collection.at(index - 1);
                 if (typeof prevModel !== 'undefined') {
                     window.curModel = prevModel
                     var prevId = prevModel.get('id')
                     Backbone.history.navigate('/r/' + this.subName + "/comments/" + prevId, {
                         trigger: true
                     })
                 }
             },
             gotoNext: function() {
                 var selectedModel = this.collection.findWhere({
                     name: this.selectedID
                 })
                 var index = this.collection.indexOf(selectedModel);
                 this.shouldWeFetchMore(index)
                 var nextModel = this.collection.at(index + 1);
                 if (typeof nextModel !== 'undefined') {
                     window.curModel = nextModel
                     var nextId = nextModel.get('id')
                     Backbone.history.navigate('/r/' + this.subName + "/comments/" + nextId, {
                         trigger: true
                     })
                 }
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
                         var currentLeft = $('#bottom-bar').css('left').replace('px', '')
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
                     if (self.isClosed === false && !self.ui.bottomBar.hasClass("transparent")) {
                         self.ui.bottomBar.addClass('transparent')
                     }

                 }, 1500);

             },
             fetchMore: function(selectAfter) {
                 if (this.loading === false) {
                     this.showLoading()

                     console.log('fetching MOAR')
                     this.loading = true
                     this.collection.fetch({
                         success: this.gotNewPosts,
                         remove: false
                     });
                 }
             },

             show: function() {
                 this.$el.show()
             },
             gotNewPosts: function(models, res) {

                 if (typeof res.data.children.length === 'undefined') {
                     return; //we might have an undefined length?
                 }

                 //fetch more  posts with the After
                 if (this.collection.after == "stop") {
                     console.log("AFTER = stop")
                     $(window).off("scroll", this.watchScroll);
                 }
                 this.loading = false; //turn the flag on to go ahead and fetch more!
                 this.hideLoading()
                 window.subs[this.subID] = this.collection
                 this.guessedWidth = -(this.collection.length * this.pixelsOfOneImg)
                 this.markSelected()
             },
             gotoSingle: function(e) {
                 //   var name = this.$(e.currentTarget).data('id')
                 var name = this.$(e.currentTarget).attr('id')
                 window.curModel = this.collection.findWhere({
                     name: name
                 })
                 console.log('curmodel=', window.curModel)
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