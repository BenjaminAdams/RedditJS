define(['underscore', 'backbone', 'view/subreddit-view', 'view/header-view', 'view/single', 'event/channel', 'backbone-queryparams'],
    function(_, Backbone, SubredditView, HeaderView, SingleView, channel) {

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
                subredditView = new SubredditView({
                    subName: "front",
                    sortOrder: sortOrder
                });
            },

            subreddit: function(subName, sortOrder) {
                subredditView = new SubredditView({
                    subName: subName,
                    sortOrder: sortOrder
                });

            },

            single: function(subName, id) {
                singleView = new SingleView({
                    subName: subName,
                    id: id
                });

            }

        });

        return AppRouter;

    });