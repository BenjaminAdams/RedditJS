define(['App', 'underscore', 'backbone', 'hbs!template/comment', 'hbs!template/commentMOAR', 'view/hover-img-view', 'view/basem-view', 'model/comment'],
  function(App, _, Backbone, commentTmpl, CommentMOAR, HoverImgView, BaseView, CommentModel) {
    return BaseView.extend({
      template: commentTmpl,
      events: {

        'click .noncollapsed .expand': "hideThread",
        'click .collapsed .expand': "showThread",
        'click .cancel': 'hideUserInput',
        'click .MOAR': 'loadMOAR',
        'click .upArrow': 'upvote',
        'click .downArrow': 'downvote',
        'mouseover .outBoundLink': 'commentLinkHover',
        'click .report': 'reportShow',
        'click .reportConfirmYes': 'reportYes',
        'click .reportConfirmNo': 'reportShow',
        'submit .commentreply': 'comment',
        'click .replyToggle': 'toggleReply',
        'click .mdHelpShow': 'showMdHelp',
        'click .mdHelpHide': 'hideMdHelp',
        'keyup .userTxtInput': 'keyPressComment'

      },
      regions: {
        'replies': '.replies',
        'hoverImgParent': '.hoverImgParent:first'
      },
      ui: {
        'upArrow': '.upArrow',
        'downArrow': '.downArrow',
        'midcol': '.midcol',
        'noncollapsed': '.noncollapsed',
        'collapsed': '.collapsed',
        'child': '.child',
        'commentreply': '.commentreply',
        'text': '.text',
        'status': '.status',
        'mdHelp': '.mdHelp',
        'mdHelpShow': '.mdHelpShow',
        'mdHelpHide': '.mdHelpHide',
        'reportConfirm': '.reportConfirm',
        'reportConfirmYes': '.reportConfirmYes',
        'userTxtInput': '.userTxtInput',
        'liveTextarea': '.liveTextarea'
      },
      initialize: function(options) {
        _.bindAll(this);
        var self = this;
        this.$parentEl = options.$parentEl //hack to load comments in the order want to

        this.model = options.model

        this.collection = this.model.get('replies')
        this.originalPoster = options.originalPoster
        this.blinking = '<img class="blinkingFakeInput" src="/img/text_cursor.gif" />'

        this.commentsDisabled = options.commentsDisabled

        this.model.set('commentsDisabled', this.commentsDisabled)

        if (this.model.get('author') === this.originalPoster) {
          this.model.set('showOriginalPoster', 'submitter')
        }

        this.name = this.model.get('name')
        this.id = this.model.get('id')
        if (this.model.get('kind') == 'more') {
          this.template = CommentMOAR
        } else {
          this.template = commentTmpl
        }

        // this.listenTo(App, "comment:addOneChild" + this.model.get('name'), this.addOneChild, this);

      },
      onShow: function() {
        var self = this

        this.addOutboundLink()
        this.permalinkParent = this.model.get('permalinkParent')
        this.setupTextareaExpanding()
      },
      onBeforeDestroy: function() {
        this.ui.userTxtInput.off('blur focus');
      },
      //add data-external and a special class to any link in a comment
      //once the links have the class outBoundLink on them, they will no longer trigger the hover view
      addOutboundLink: function() {
        this.$('.hoverImgParent a').addClass('outBoundLink').attr("data-bypass", "true"); //makes the link external to be clickable
        this.$('.hoverImgParent a').attr('target', '_blank');
      },
      loadMOAR: function(e) {
        e.preventDefault()
        e.stopPropagation()
        $(this.el).html("<div class='loadingS'></div>")
        var self = this

        var link_id = this.model.get('link_id')
        var params = {
          link_id: link_id,
          id: this.id,
          api_type: 'json',
          children: this.model.get('children').join(","),
          byPassAuth: true
        };
        console.log('MOAR=', params)

        //TODO: move this URL generating logic to the model
        if (this.checkIfLoggedIn() === true) {

          this.api("api/morechildren.json", 'POST', params, this.gotDataFromRenderMoar);

        } else {

          this.apiNonAuth("api/morechildren.json", 'POST', params, this.gotDataFromRenderMoar);
        }

      },
      gotDataFromRenderMoar: function(data) {
        var self = this
        if (typeof data !== 'undefined' && typeof data.json !== 'undefined' && typeof data.json.data !== 'undefined' && typeof data.json.data.things !== 'undefined') {
          data.children = data.json.data.things
          var tmpModel = new CommentModel({
            skipParse: true
          })

          var newComments = parseComments(data, self.model.get('link_id'))
          self.reRenderMOAR(newComments)
        } else {

          self.render()

        }
      },
      reRenderMOAR: function(newComments) {
        if (typeof newComments !== 'undefined' && newComments.length > 0) {
          //pluck the first model in the collection and set it as this model for reRendering
          this.model = newComments.at(0)
          newComments = newComments.slice(1, newComments.length)
          newComments = new Backbone.Collection(newComments)

          this.model.set('permalink', this.permalinkParent + this.model.get('id'))
          this.model.set('permalinkParent', this.permalinkParent)

          //change template back to normal comment template
          this.template = commentTmpl
          this.$el.empty()
          this.render()

          this.renderOtherReplyComments(newComments)
          var replies = this.model.get('replies')
          this.collection.add(replies)
          this.addOutboundLink()
        }
      },

      hideThread: function(e) {
        e.preventDefault()
        e.stopPropagation()

        this.ui.noncollapsed.hide()
        this.ui.collapsed.show()
        this.ui.child.hide()
        this.ui.midcol.hide()

      },
      showThread: function(e) {
        e.preventDefault()
        e.stopPropagation()
        this.ui.collapsed.hide()
        this.ui.noncollapsed.show()
        this.ui.child.show()
        this.ui.midcol.show()

      },
      //shows the comment reply textbox
      toggleReply: function(e) {
        e.preventDefault()
        e.stopPropagation()
        this.ui.commentreply.toggle().find('.text').focus()
        if (!this.replyHasBeenToggledOnce) {
          this.setupTextareaExpanding()
          this.replyHasBeenToggledOnce = true
        }

      },
      commentLinkHover: function(e) {
        e.preventDefault()
        e.stopPropagation()
        if (App.settings.get('cmtLoad') === true) {
          if (App.Delay !== true) {
            var target = $(e.currentTarget)

            var url = $(target).attr("href")

            var youtubeID = this.youtubeChecker(url);
            //check if the url is an image we can embed
            if (youtubeID === false) {
              url = url.replace(/(\?.*)|(#.*)|(&.*)/g, "")
            }
            if (this.checkIsImg(url) === false) {
              //URL is NOT an image
              //try and fix an imgur link?
              url = this.fixImgur(url)

            }

            if (url !== false || youtubeID !== false) {

              var ahrefDescription = $(target).text()
              if (!ahrefDescription) {
                ahrefDescription = url
              }

              var originalText = $('.outBoundLink:first').parent().parent().text().trim()
              var originalHtml = this.$('.outBoundLink:first').parent().parent().html()
              if (youtubeID) {
                url = $(target).attr("href") //in case it was a youtube video we should reset the url link to pass into the view
              }

              this.hoverImgParent.show(new HoverImgView({
                url: url,
                ahrefDescription: ahrefDescription,
                originalText: originalText,
                originalHtml: originalHtml,
                youtubeID: youtubeID

              }))

            }
          }
        }
      },
      renderOtherReplyComments: function(collection) {
        console.log('other replies', collection)
        var self = this
        collection.each(function(model) {
          App.trigger("comment:addOneChild" + model.get('parent_id'), model);
        })

      },
      /**************Fetching functions ****************/
      fetchError: function(response, error) {
        console.log("fetch error, lets retry")

      },
      loaded: function(model, res) {
        this.$('.loading').hide()
        this.render();
      }
    });

  });
