define(['App', 'jquery', 'underscore', 'backbone', 'hbs!template/post-row', 'hbs!template/post-row-large', 'hbs!template/post-row-small', 'view/basem-view'],
    function(App, $, _, Backbone, PostRowTmpl, PostRowLargeTmpl, PostRowSmallTmpl, BaseView) {
        return BaseView.extend({
            // template: PostRowTmpl,
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
                'postRowContent': '.postRowContent'
            },

            initialize: function(data) {
                _.bindAll(this);
                this.model = data.model;
                //this.template = PostRowTmpl;
                this.gridOption = data.gridOption
                if (typeof data.expand !== 'undefined') {
                    this.expand = true;
                }

                if (this.gridOption == "normal") {
                    this.template = PostRowTmpl
                } else if (this.gridOption == "large") {
                    this.template = PostRowLargeTmpl
                } else if (this.gridOption == "small") {
                    this.template = PostRowSmallTmpl
                }

            },
            onRender: function() {
                if (this.expand === true) {
                    this.toggleExpando()
                }
            },
            gotoSingle: function(e) {
                var target = this.$(e.currentTarget)
                var permalink = this.model.get('permalink')
                var targetLink = target.attr('href')
                if (permalink == targetLink) {
                    // console.log('it worked', this.model)
                    //I've made the choice here to pass the current model as a global so we do not have to have a long load time
                    //the single post page takes 2-3 seconds to load the get request
                    window.curModel = this.model

                }

            },
            toggleExpando: function() {
                if (this.ui.expandoButton.hasClass('expanded')) {
                    this.ui.expandoButton.removeClass('expanded')
                    this.ui.expandoButton.addClass('collapsed')
                    this.ui.postRowContent.html('').hide()
                } else {
                    var model = this.model
                    this.ui.expandoButton.removeClass('collapsed')
                    this.ui.expandoButton.addClass('expanded')
                    var str = '<div class="expando"><div class="usertext-body"><p>' + this.model.get('media_embed') + '</p></div></div>'

                    this.ui.postRowContent.html(str).show()
                }
            }

        });
    });