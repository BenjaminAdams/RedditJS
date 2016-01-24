define(['App', 'underscore', 'backbone', 'hbs!template/slideshow', 'view/basem-view', 'view/post-row-view', 'model/single'],
  function(App, _, Backbone, TMPL, BaseView, PostRowView, SingleModel) {
    return BaseView.extend({ //extend from single-view.js
      template: TMPL,
      className: 'slideshowSingleContainer',
      events: {
        'click #retry': 'tryAgain',
        'click #fullscreen': 'goFullScreen',
        'click #exitBtn': 'exitSlideshow',
        'click #slideshow': 'gotoNextOrPrev',
        'click #togglePlayPause': 'togglePlayPause',
        'keyup .userTxtInput': 'keyPressComment',
        'change #slide': 'updateTimer'
      },
      regions: {
        'thepost': '#thepost',
        'siteTableComments': '#siteTableComments'
      },
      ui: {
        'currentImg': '#currentImg',
        'togglePlayPause': '#togglePlayPause'
      },
      initialize: function(options) {
        _.bindAll(this);
        //$(document).bind('keyup', this.keyPressComment);
        var self = this;

        this.subName = options.subName
        this.id = options.id
        this.hasRendered = false

        if (typeof App.curModel === 'undefined') {
          this.fetchModel(null)
        } else {
          //console.log('loading a model from memory')
          this.model = App.curModel;
          this.updatePageTitle(this.model.get('title') + ' | slideshow');
          delete App.curModel; //memory management
          this.renderModel(this.model);
        }

        this.listenTo(App, "single:remove", this.remove, this);
        this.listenTo(App, "single:giveBtnBarID", this.triggerID, this);

        this.startSlideTimer()
      },
      onRender: function() {
        var self = this

        $('#content').addClass('slideShow')

        if (typeof this.model.get('ups') !== 'undefined') {
          this.triggerID()

          this.ui.currentImg.on('error', this.imgFailed)

        }

        if (typeof this.model !== 'undefined' && typeof this.model.get('ups') !== 'undefined') {
          //make sure the model is loaded before we display the top post

          this.thepost.show(new PostRowView({
            model: self.model,
            gridOption: 'normal',
            disableExpand: true,
            isSingle: true
          }));

        }

      },
      onBeforeDestroy: function() {
        $('#content').removeClass('slideShow')
        this.ui.currentImg.off('error')
        clearTimeout(this.slideShowNext);
      },
      startSlideTimer: function() {
        var self = this

        this.slideShowNext = setTimeout(function() {
          if (App.slideShowPaused === true) return
          self.gotoNext()
        }, App.slideShowSpeed)
      },
      updateTimer: function(e) {
        var target = $(e.currentTarget)
        clearTimeout(this.slideShowNext);
        var newTimeout = target.val() * 1000
        App.slideShowSpeed = newTimeout
        $.cookie('slideShowSpeed', newTimeout)
        this.startSlideTimer()

      },
      togglePlayPause: function() {
        if (App.slideShowPaused === true) {
          this.ui.togglePlayPause.removeClass('fa-play').addClass('fa-pause')
          App.slideShowPaused = false;
          $.cookie('slideShowPaused', 'false')
        } else {
          App.slideShowPaused = true;
          $.cookie('slideShowPaused', 'true')
          this.ui.togglePlayPause.removeClass('fa-pause').addClass('fa-play')

        }
      },
      goFullScreen: function() {
        this.fullScreen(document.body);
      },
      imgLoaded: function(x, y, z) {
        console.log(x, y, z)
      },
      imgFailed: function(x, y, z) {
        this.ui.currentImg.attr('src', '/img/sad-icon.png')
        this.gotoNext()
      },

      toggleDropDownCmtSort: function() {
        this.$('.drop-choices-single').toggle()
      },

      updatePageTitle: function(title) {
        document.title = title + " | redditJS.com"
      },

      fetchModel: function() {
        this.model = new SingleModel({
          subName: this.subName,
          id: this.id
        });

        this.fetchXhr = this.model.fetch({
          success: this.renderModel,
          error: this.fetchError
        });
      },
      fetchError: function(response, error) {
        $(this.el).html("<div id='retry'><div class='loading'></div> </div>")
        $(this.el).html("<div id='retry'><img src='/img/sad-icon.png' /><br/> click here to try again </div>")

      },

      tryAgain: function() {
        this.model.fetch({
          success: this.renderModel,
          //error: this.nextErrorFunctionToRun
        });
      },
      gotoPrev: function() {
        App.trigger('btmbar:gotoPrev')
      },
      gotoNext: function() {
        App.trigger('btmbar:gotoNext')
      },
      renderModel: function(model) {
        // this.template = TMPL
        this.model.set('slideShowPaused', App.slideShowPaused)
        this.model.set('slideShowSpeed', parseInt(App.slideShowSpeed, 10) / 1000)
        this.render()

        this.hasRendered = true

      },
      triggerID: function() {
        //tells the btm bar which ID we are on
        App.trigger("bottombar:selected", "t3_" + this.id);
        //App.trigger("bottombar:selected", this.model);
      },
      exitSlideshow: function() {

        var gotoUrl = '/r/' + this.subName
        if (this.model && this.model.get('actualPermalink')) {
          //goto the current slide the user was on or send them to subreddit page
          gotoUrl = this.model.get('actualPermalink')
        }

        Backbone.history.navigate(gotoUrl, {
          trigger: true
        });
      },
      gotoNextOrPrev: function(e) {
        console.log('slideshow clicked', e)
          //figure out if the user clicked on the left or the right side of the screen and navigation properly
        var pageWidth = $(document).width();
        if (e.clientX > (pageWidth / 2)) {
          //user clicked on right side of slideshow
          this.gotoNext()
        } else {
          //user clicked on left side of slideshow
          this.gotoPrev()
        }

      }

    });

  });
