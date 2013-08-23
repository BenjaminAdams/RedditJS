define(['jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/post-row', 'hbs!template/post-row-large', 'view/base-view'],
    function($, _, Backbone, Resthub, PostRowTmpl, PostRowLargeTmpl, BaseView) {
        var PostRowView = BaseView.extend({
            strategy: 'append',

            events: function() {
                var _events = {
                    //    'click .noncollapsed .expand': "hideThread",
                };
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

        });
        return PostRowView;
    });