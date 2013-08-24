define(['underscore', 'backbone', 'view/subreddit-view', 'view/header-view', 'view/single', 'view/sidebar-view', 'event/channel', 'backbone-queryparams'],
    function(_, Backbone, SubredditView, HeaderView, SingleView, SidebarView, channel) {

        var AppRouter = Backbone.Router.extend({

            initialize: function() {
                Backbone.history.start({
                    pushState: true,
                    root: "/"
                });

                this.header = new HeaderView();

            },
            /*  route for comment page:
        r/worldnews/comments/1kvql3/orders_to_destroy_guardian_hard_drives_came/

        */
            routes: {
                '(:sortOrder)(/)': 'home',
                'r/:subName(/)': 'subreddit',
                'r/:subName/:sortOrder': 'subreddit',
                'r/:subName/comments/:id/:slug(/)': 'single',
                //  'r/:subName/': 'subreddit'
            },

            home: function(sortOrder) {
                console.debug("Main route activated");
                this.doSidebar('front');

                subredditView = new SubredditView({
                    subName: "front",
                    sortOrder: sortOrder
                });
            },

            subreddit: function(subName, sortOrder) {

                this.doSidebar(subName);

                subredditView = new SubredditView({
                    subName: subName,
                    sortOrder: sortOrder
                });

            },

            single: function(subName, id) {

                this.doSidebar(subName);

                singleView = new SingleView({
                    subName: subName,
                    id: id
                });

            },
            doSidebar: function(subName) {
                this.sidebar = new SidebarView({
                    subName: subName,
                })
            }

        });

        return AppRouter;

    });