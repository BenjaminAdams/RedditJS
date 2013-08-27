define(['jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/post-row', 'hbs!template/post-row-large', 'view/base-view'],
    function($, _, Backbone, Resthub, PostRowTmpl, PostRowLargeTmpl, BaseView) {
        var PostRowView = BaseView.extend({
            strategy: 'append',

            events: function() {
                var _events = {
                    'click a': "gotoSingle",
                };

                _events['click #report' + this.options.id] = "reportShow";
                _events['click #reportConfirmYes' + this.options.id] = "reportYes"; //user clicks yes to report 
                _events['click #reportConfirmNo' + this.options.id] = "reportShow"; //user decides not to report this link/comment

                _events['click #hide' + this.options.id] = "hidePost"; //user wants to hide this post
                _events['click #save' + this.options.id] = "savePost"; //user wants to hide this post
                _events['click #unsave' + this.options.id] = "unSavePost"; //user wants to hide this post

                _events['click .upArrow' + this.options.id] = "upvote";
                _events['click .downArrow' + this.options.id] = "downvote";
                return _events;
            },

            initialize: function(data) {
                this.model = data.model;
                //this.template = PostRowTmpl;
                this.gridOption = data.gridOption

                if (this.gridOption == "normal") {
                    this.template = PostRowTmpl
                } else {
                    this.template = PostRowLargeTmpl
                }

                this.render();
                // this.$() is a shortcut for this.$el.find().
            },
            gotoSingle: function(e) {
                var target = this.$(e.currentTarget)
                var permalink = this.model.get('permalink')
                var targetLink = target.attr('href')
                if (permalink == targetLink) {
                    console.log('it worked', this.model)
                    //I've made the choice here to pass the current model as a global so we do not have to have a long load time
                    //the single post page takes 2-3 seconds to load the get request
                    window.curModel = this.model

                }

            }

        });
        return PostRowView;
    });