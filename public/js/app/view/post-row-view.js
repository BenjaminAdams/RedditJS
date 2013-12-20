define(['App', 'jquery', 'underscore', 'backbone', 'view/basem-view', 'hbs!template/post-row'],
    function(App, $, _, Backbone, BaseView, PostRowTmpl) {
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
                'drag .dragImg': 'dragImg'

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
                this.dragImgMinWidth = 100

                // this.isSingle = data.isSingle || false
                if (data.isSingle && this.model.get('is_self') === false) {
                    //changes the main post link to be external instead of linking back to itself
                    this.model.set('url', this.model.get('actualUrl'))
                    this.model.set('external', 'data-bypass')
                }

                if (typeof data.expand !== 'undefined' && (this.model.get('embededImg') === true || this.model.get('selftext_html'))) {
                    console.log('expandhtml=', this.model.get('expandHTML'))
                    this.expand = true;
                }
                if (this.gridOption == "normal") {
                    this.template = PostRowTmpl
                }
                // if (this.gridOption == "normal") {
                //     this.template = PostRowTmpl
                // } else if (this.gridOption == "large") {
                //     this.template = PostRowLargeTmpl
                // } else if (this.gridOption == "small") {
                //     this.template = PostRowSmallTmpl
                // }

            },
            onRender: function() {
                if (this.expand === true) {
                    this.toggleExpando()
                }
            },
            gotoSingle: function(e) {
                var self = this

                var target = $(e.currentTarget)
                var permalink = this.model.get('permalink')
                var targetLink = target.attr('href')
                if (permalink == targetLink) {
                    // console.log('it worked', this.model)
                    //I've made the choice here to pass the current model as a global so we do not have to have a long load time
                    //the single post page takes 2-3 seconds to load the get request
                    setTimeout(function() {
                        window.curModel = self.model //the small view closes too fast and is unable to pass the model to the single
                    }, 5)
                    window.curModel = this.model
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
                }
                console.log(target.width())
                if ((this.lastDragPos.x > e.originalEvent.pageX || this.lastDragPos.y > e.originalEvent.pageY) && targetWidth > this.dragImgMinWidth) {
                    target.width(targetWidth - 20)
                } else {
                    target.width(targetWidth + 20)
                }

                clearTimeout(this.dragTimeout);
                this.dragTimeout = setTimeout(function() {
                    this.lastDragPos = {} //resets the direction the user wants to drag the image
                }, 400);

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
                        str = '<div class="expando"><div class="usertext-body blueborder">' + this.model.get('selftext_html') + '</div></div>'
                    } else {
                        str = this.model.get('media_embed')
                    }

                    this.ui.postRowContent.html(str).show()
                }
            }

        });
    });