define(['App', 'underscore', 'backbone', 'hbs!template/slideshow', 'hbs!template/loading', 'view/post-row-view', 'view/sidebar-view', 'view/single-view', 'model/single', 'cookie'],
  function(App, _, Backbone, TMPL, loadingTmpl, PostRowView, SidebarView, BaseView, SingleModel, Cookie) {
    return BaseView.extend({ //extend from single-view.js
      template: TMPL,
      events: {
        'click #retry': 'tryAgain',
        'click .leftArrow': 'gotoPrev',
        'click .rightArrow': 'gotoNext',
        'keyup .userTxtInput': 'keyPressComment',

      },
      regions: {
        'thepost': '#thepost',
        'siteTableComments': '#siteTableComments'
      },
      ui: {
        loadingC: '#loadingC',
        text: '.text',
        commentreply: '.commentreply',
        'mdHelp': '.mdHelp',
        'mdHelpShow': '.mdHelpShow',
        'mdHelpHide': '.mdHelpHide',
        'status': '.status',
        'singleCommentText': '#singleCommentText',
        'userTxtInput': '.userTxtInput',
        'liveTextarea': '.liveTextarea',
        'noCommentError': '.noCommentError'
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
          this.template = loadingTmpl

        } else {
          console.log('loading a model from memory')
          this.model = App.curModel;
          this.updatePageTitle(this.model.get('title'));
          delete App.curModel; //memory management
          this.renderModel(this.model);
        }

        App.on("single:remove", this.remove, this);
        App.on("single:giveBtnBarID", this.triggerID, this);

      },
      onRender: function() {
        var self = this

        $('#content').addClass('slideShow')

        // if (typeof this.model !== 'undefined') {

        //   self.thepost.show(new PostRowView({
        //     model: self.model,
        //     gridOption: 'normal',
        //     expand: true,
        //     isSingle: true
        //   }));

        // }
        // this.triggerID()
        // this.scrollTop()
        // $(window).resize(this.debouncer(function(e) {
        //   self.resize()
        // }));
        // this.disableComment()
        // this.addOutboundLink()

        // this.setupTextareaExpanding()

      },
      onBeforeDestroy: function() {
        //this.constructor.__super__.initialize.apply(this, arguments);
        $('#content').removeClass('slideShow')
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
          id: this.id,
          parseNow: true
        });

        //this.render();
        this.fetchXhr = this.model.fetch({
          success: this.renderModel,
          error: this.fetchError
        });

      },

      triggerID: function() {
        //App.trigger("bottombar:selected", "t3_" + this.id);
        //App.trigger("bottombar:selected", this.model);
      },

      fetchError: function(response, error) {
        $(this.el).html("<div id='retry'><div class='loading'></div> </div>")
        $(this.el).html("<div id='retry'><img src='/img/sad-icon.png' /><br/> click here to try again </div>")
        this.ui.loadingC.hide()

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

        this.template = TMPL
        this.render()

        this.hasRendered = true

      }

    });

  });
