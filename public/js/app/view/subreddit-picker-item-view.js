define(['App', 'jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/subreddit-picker-item', 'view/base-view'],
    function(App, $, _, Backbone, Resthub, SRPitemTmpl, BaseView) {
        return BaseView.extend({
            strategy: 'append',
            template: SRPitemTmpl,
            events: {
                'click .add': 'subscribe',
                'click .remove': 'unsubscribe'
            },

            initialize: function(data) {
                this.model = data.model;

                this.render();

            },
            subscribe: function(e) {
                e.preventDefault()
                e.stopPropagation()
                var target = this.$(e.currentTarget)
                target.removeClass('add').addClass('remove').html('unsubscribe')

                var params = {
                    action: 'sub',
                    sr: this.model.get('name'),
                    sr_name: this.model.get('name'),
                    uh: $.cookie('modhash')
                };

                console.log(params)

                this.api("api/subscribe", 'POST', params, function(data) {
                    console.log("subscribe done", data)
                    //edit the window and cookie
                    App.trigger('header:refreshSubreddits')

                });

            },
            unsubscribe: function(e) {
                e.preventDefault()
                e.stopPropagation()
                var target = this.$(e.currentTarget)
                target.removeClass('remove').addClass('add').html('subscribe')
                var params = {
                    action: 'unsub',
                    sr: this.model.get('name'),
                    uh: $.cookie('modhash')
                };

                console.log(params)

                this.api("api/subscribe", 'POST', params, function(data) {
                    console.log("unsubscribe done", data)
                    App.trigger('header:refreshSubreddits')
                });
            }

        });

    });