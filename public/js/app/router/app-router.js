define(['underscore', 'backbone', 'marionette', 'event/channel'],
    function(_, Backbone, Marionettel, channel) {

        var AppRouter = Backbone.Marionette.AppRouter.extend({
            appRoutes: {
                'r/myrandom(/)': 'myrandom',
                'r/:subName/submit(/)': 'submit',
                'submit(/)': 'submit',
                'prefs(/)': 'prefs',
                '(:sortOrder)(/)': 'home',
                'r/:subName(/)': 'subreddit',
                'r/:subName/:sortOrder(/)': 'subreddit',
                //http://www.reddit.com/domain/i.imgur.com/new/
                'domain/:domain(/)': 'subredditDomain',
                'domain/:domain/:sortOrder(/)': 'subredditDomain',

                'r/:subName/comments/:id/:slug(/)': 'single',
                'r/:subName/comments/:id(/)': 'single',

                'user/:username(/)': 'user',
                'user/:username/:sortOrder(/)': 'user',
                'message/compose/:username(/)': 'compose',
                'message/:type(/)': 'inbox',
                'subreddits(/)': 'subreddits',
                'search': 'search',
                'search/:q(/)': 'search',
                'search/:q/:timeFrame(/)': 'search',
                'search/:q/:timeFrame/:sortOrder(/)': 'search'

            },
            //middleware, this will be fired before every route
            route: function(route, name, callback) {
                var router = this;
                if (!callback) callback = this[name];
                var f = function() {
                    //middleware functions
                    console.log('usr=', $.cookie('username'))

                    //check if user is a reddit gold subscriber
                    // if (window.settings.get('gold') != true && $.cookie('username') != 'armastevs') {

                    //     //  $('.content').html('redditJS is for reddit gold members only, coming soon =)')

                    // require(['view/login-popup-view'], function(LoginPopupView) {

                    //     var loginPopupView = new LoginPopupView({
                    //         el: "#popupWindow"
                    //     })

                    //     });

                    //     return;
                    // }

                    channel.trigger("subreddit:remove") //clear old subreddit views
                    channel.trigger("single:remove") //clear old subreddit views

                    if (name != 'single') { //hide the bottom bar if not in single view
                        $("#bottom-bar").hide()
                        channel.trigger("btmbar:remove")
                        this.bottomBar = null;

                    }

                    $('#imgCache').empty() //flush the image thumbnail cache

                    //end middleware functions
                    callback.apply(router, arguments); //call the actual route
                };
                return Backbone.Router.prototype.route.call(this, route, name, f);
            }

        });

        return AppRouter;

    });