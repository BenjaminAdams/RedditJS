define(['jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/post-row', 'hbs!template/post-row-large', 'hbs!template/post-row-small', 'view/base-view'],
    function($, _, Backbone, Resthub, PostRowTmpl, PostRowLargeTmpl, PostRowSmallTmpl, BaseView) {
        var PostRowView = BaseView.extend({
            strategy: 'append',

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

            initialize: function(data) {
                this.model = data.model;
                //this.template = PostRowTmpl;
                this.gridOption = data.gridOption

                if (this.gridOption == "normal") {
                    this.template = PostRowTmpl
                } else if (this.gridOption == "large") {
                    this.template = PostRowLargeTmpl
                } else if (this.gridOption == "small") {
                    this.template = PostRowSmallTmpl
                }

                this.render();
                // this.$() is a shortcut for this.$el.find().
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
                if (this.$('.expando-button').hasClass('expanded')) {
                    this.$('.expando-button').removeClass('expanded')
                    this.$('.expando-button').addClass('collapsed')
                    this.$('.postRowContent').html('').hide()
                } else {
                    this.$('.expando-button').removeClass('collapsed')
                    this.$('.expando-button').addClass('expanded')
                    var str = '<div class="expando"><div class="usertext-body"><p>' + this.model.get('media_embed') + '</p></div></div>'
                    console.log(str)
                    this.$('.postRowContent').html(str).show()
                }
            }

        });
        return PostRowView;
    });