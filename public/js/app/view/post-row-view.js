define(['App', 'jquery', 'underscore', 'backbone', 'view/basem-view', 'hbs!template/post-row', 'hbs!template/post-row-small', 'hbs!template/post-row-large', 'view/hover-img-view'],
    function(App, $, _, Backbone, BaseView, PostRowTmpl, PostRowSmallTmpl, PostRowLargeTmpl, HoverImgView) {
        return BaseView.extend({

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
                'click .expando-button': 'toggleExpando',
                'click .share-button': 'toggleShare',
                'drag .dragImg': 'dragImg',
                'mouseover .outBoundLink': 'postLinkHover'
            },
            regions: {
                hoverImgParent: '.md:first'
            },
            ui: {
                'expandoButton': '.expando-button',
                'postRowContent': '.postRowContent',
                upArrow: '.upArrow',
                downArrow: '.downArrow',
                midcol: '.midcol',
                'reportConfirm': '.reportConfirm',
                'reportConfirmYes': '.reportConfirmYes',
                'save': '.save',
                'unsave': '.unsave'
            },
            initialize: function(data) {
                //  _.bindAll(this);
                this.model = data.model;
                this.gridOption = data.gridOption

                this.lastDragPos = {} //keeps track of what direction the user is dragging the image
                this.dragTimeout = null;
                this.dragImgMinWidth = 100;

                this.expand = data.expand

                // this.isSingle = data.isSingle || false
                if (data.isSingle && this.model.get('is_self') === false) {
                    //changes the main post link to be external instead of linking back to itself
                    this.tmpLink = this.model.get('url')
                    this.model.set('url', this.model.get('actualUrl'))
                    this.model.set('external', 'data-bypass')
                } else {
                    //so when the user returns to the subreddit page, we set the model back to non-external link
                    //  this.model.set('url', this.model.get('permalink'))
                    //  this.model.set('external', '')
                }

                if (typeof this.expand !== 'undefined' && this.expand !== false && (this.model.get('embededImg') === true || this.model.get('selftext_html'))) {
                    this.expand = true;
                }

                if (this.gridOption == "normal" || typeof this.gridOption === 'undefined' || this.gridOption === null) {
                    this.template = PostRowTmpl
                } //else if (this.gridOption == "small") {
                //     this.template = PostRowSmallTmpl
                // } else if (this.gridOption == "large") {
                //     this.template = PostRowLargeTmpl
                // }

                if (App.slideShowActive) {
                    this.model.set('permalink', '/comments/' + this.model.get('subreddit') + "/" + this.model.get('id') + '/slideshow');
                }

                this.model.set('expand', this.expand)

            },
            onRender: function() {
                if (this.expand === true) {
                    this.toggleExpando()
                }
            },
            OnBeforeDestroy: function() {
                if (this.tmpLink) {
                    this.model.set('url', this.tmpLink)
                    this.model.set('external', '')
                }
            },

            dragImg: function(e) {
                var self = this

                var target = $(e.currentTarget)
                var targetWidth = target.width()
                var position = target.position();

                if ($.isEmptyObject(this.lastDragPos)) {
                    this.lastDragPos.x = e.originalEvent.pageX
                    this.lastDragPos.y = e.originalEvent.pageY
                        //create img where person clicked mouse to indicate draging direction

                    var posIndicator = $('<div class="dragIndicatorImg"> </div>').css({
                        top: e.originalEvent.clientY,
                        left: e.originalEvent.clientX
                    })
                    $('body').append(posIndicator)

                }

                if ((this.lastDragPos.x > e.originalEvent.pageX || this.lastDragPos.y > e.originalEvent.pageY) && targetWidth > this.dragImgMinWidth) {
                    target.width(targetWidth - 5)
                } else {
                    target.width(targetWidth + 5)
                }

                clearTimeout(this.dragTimeout);
                this.dragTimeout = setTimeout(function() {
                    self.lastDragPos = {} //resets the direction the user wants to drag the image
                    $('.dragIndicatorImg').remove()
                }, 1000);

            },
            postLinkHover: function(e) {
                //console.log('hovering over a comment')
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

                            //$(target).css('float', 'left')
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
            toggleExpando: function() {
                //if (this.model.get('embededImg') === false && this.expand === false) {
                // this.ui.expandoButton.hide()
                // return
                //}

                var str;
                if (this.ui.expandoButton.hasClass('expanded')) {
                    this.ui.expandoButton.removeClass('expanded')
                    this.ui.expandoButton.addClass('collapsed')
                    this.ui.postRowContent.html('').hide()
                } else {
                    var model = this.model
                    this.ui.expandoButton.removeClass('collapsed')
                    this.ui.expandoButton.addClass('expanded')

                    if (this.model.get('is_self') === true) {
                        str = '<div class="expando"><div class="usertext-body usertext blueborder">' + this.model.get('selftext_html') + '</div></div>'
                    } else {
                        str = this.model.get('media_embed')
                    }

                    this.ui.postRowContent.html(str).show()

                    this.addOutboundLink()
                }
            }

        });
    });
