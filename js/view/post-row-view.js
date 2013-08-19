define(['jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/post-row', 'model/post', 'view/base-view'],
    function($, _, Backbone, Resthub, PostRowTmpl, PostModel, BaseView) {
        var PostRowView = BaseView.extend({
            strategy: 'append',
            events: {
                'click .up': 'upvote',
                //  'keyup #new-todo':     'showTooltip'
            },

            initialize: function(data) {
                this.model = data.model;
                this.template = PostRowTmpl;
                this.render();
                // this.$() is a shortcut for this.$el.find().
            },
            upvote: function() {
                this.vote(1)
            },
            vote: function(dir) {
                var modhash = $.cookie('modhash')

                var params = {
                    id: this.model.get('name'),
                    dir: dir,
                    uh: modhash,
                };

                this.api("api/vote", 'POST', params, function(data) {
                    console.log(data)
                });
            }

        });
        return PostRowView;
    });