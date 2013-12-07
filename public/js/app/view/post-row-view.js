define(['App', 'jquery', 'underscore', 'backbone', 'hbs!template/post-row', 'hbs!template/post-row-large', 'hbs!template/post-row-small', 'view/basem-view'],
    function(App, $, _, Backbone, PostRowTmpl, PostRowLargeTmpl, PostRowSmallTmpl, BaseView) {
        return BaseView.extend({
            //template: PostRowTmpl,
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
                'click .expando-button': 'toggleExpando'
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
                _.bindAll(this);
                this.model = data.model;
                this.gridOption = data.gridOption

                // this.isSingle = data.isSingle || false
                if (data.isSingle && this.model.get('is_self') === false) {
                    //changes the main post link to be external instead of linking back to itself
                    this.model.set('url', this.model.get('actualUrl'))
                    this.model.set('external', 'data-bypass')
                }

                if (typeof data.expand !== 'undefined') {
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
                        str = '<div class="expando"><div class="usertext-body"><p>' + this.model.get('media_embed') + '</p></div></div>'
                    }

                    this.ui.postRowContent.html(str).show()
                }
            }

        });
    });