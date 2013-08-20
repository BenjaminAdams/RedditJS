define(['underscore', 'backbone', 'view/subreddit-view', 'view/header-view',
    'backbone-queryparams'], function(_, Backbone, SubredditView, HeaderView) {

    var AppRouter = Backbone.Router.extend({

        initialize: function() {
            Backbone.history.start({
                pushState: true,
                root: "/"
            });

            this.header = new HeaderView();

        },

        routes: {
            '': 'main',
            'r/:subName(/)': 'subreddit',
            //  'r/:subName/': 'subreddit'
        },

        main: function() {
            console.debug("Main route activated");
            subredditView = new SubredditView({
                subName: "front"
            });
        },

        subreddit: function(subName) {
            console.debug("subreddit route for " + subName + "activated");
            subredditView = new SubredditView({
                subName: subName
            });

        }
    });

    return AppRouter;

});