define(['underscore', 'backbone', 'view/subreddit-view', 'view/header-view', 'view/search-view', 'view/single', 'view/sidebar-view', 'view/bottom-bar-view', 'event/channel', 'backbone-queryparams'],
    function(_, Backbone, SubredditView, HeaderView, SearchView, SingleView, SidebarView, BottomBarView, channel) {

        var AppRouter = Backbone.Router.extend({

            initialize: function() {
                //what happens if we keep subreddits in a global?
                window.subs = new Array()

                Backbone.history.start({
                    pushState: true,
                    root: "/"
                });

                this.header = new HeaderView();

            },
            routes: {
                '(:sortOrder)(/)': 'home',
                'r/:subName(/)': 'subreddit',
                'r/:subName/:sortOrder(/)': 'subreddit',
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
                'search/:q/:timeFrame/:sortOrder(/)': 'search',

            },
            //middleware, this will be fired before every route
            route: function(route, name, callback) {
                var router = this;
                if (!callback) callback = this[name];
                var f = function() {
                    //middleware functions
                    channel.trigger("subreddit:remove") //clear old subreddit views
                    channel.trigger("single:remove") //clear old subreddit views

                    if (name != 'single') { //hide the bottom bar if not in single view
                        $("#bottom-bar").hide()
                    }

                    $('#imgCache').empty() //flush the image thumbnail cache

                    //end middleware functions
                    callback.apply(router, arguments); //call the actual route
                };
                return Backbone.Router.prototype.route.call(this, route, name, f);
            },

            home: function(sortOrder) {

                channel.trigger("header:updateSortOrder")

                this.doSidebar('front');

                var subredditView = new SubredditView({
                    subName: "front",
                    sortOrder: sortOrder || 'hot',
                });
            },

            subreddit: function(subName, sortOrder) {

                this.doSidebar(subName);

                var subredditView = new SubredditView({
                    subName: subName,
                    sortOrder: sortOrder || 'hot',
                });

            },

            single: function(subName, id) {

                this.doSidebar(subName);

                var singleView = new SingleView({
                    subName: subName,
                    id: id,
                });

                if (typeof this.bottomBar === 'undefined' || this.bottomBar.subName != subName) { //only update btm bar if the subreddit changes
                    this.bottomBar = new BottomBarView({
                        subName: subName,
                        id: id,
                    })
                } else {
                    this.bottomBar.show()
                }

            },

            user: function(username, sortOrder) {
                var self = this
                require(['view/user-sidebar-view', 'view/user-view'], function(UserSidebarView, UserView) {
                    self.sidebar = new UserSidebarView({
                        username: username,
                    })
                    console.log('in router =', username + " " + sortOrder)
                    var userView = new UserView({
                        username: username,
                        sortOrder: sortOrder
                    });
                });
            },
            compose: function(username) {
                console.log('compose view', username)
                require(['view/compose-view'], function(ComposeView) {
                    var composeView = new ComposeView({
                        username: username,
                    });
                });
            },
            inbox: function(type) {
                console.log('msg view, type= ', type)
                require(['view/inbox-view'], function(InboxView) {
                    var inboxView = new InboxView({
                        type: type
                    });
                });
            },
            subreddits: function() {

            },
            search: function(searchQ, timeFrame, sortOrder) {

                this.doSidebar('front');

                var search = new SearchView({
                    searchQ: searchQ,
                    timeFrame: timeFrame,
                    sortOrder: sortOrder,
                });
            },

            doSidebar: function(subName) {
                if (typeof this.sidebar === 'undefined' || this.sidebar.subName != subName) { //only update sidebar if the subreddit changes
                    this.sidebar = new SidebarView({
                        subName: subName,
                    })
                }
            }

        });

        return AppRouter;

    });