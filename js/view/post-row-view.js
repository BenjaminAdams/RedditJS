define(['jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/post-row', 'hbs!template/post-row-large', 'model/post', 'view/base-view'],
    function($, _, Backbone, Resthub, PostRowTmpl, PostRowLargeTmpl, PostModel, BaseView) {
        var PostRowView = BaseView.extend({
            strategy: 'append',

            events: {
                'click .upArrow': 'upvote',
                'click .downArrow': 'downvote',
                //  'keyup #new-todo':     'showTooltip'
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