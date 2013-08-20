define(['underscore', 'backbone', 'view/subreddit-view', 'backbone-queryparams'], function(_, Backbone, SubredditView) {

    var AppRouter = Backbone.Router.extend({

        initialize: function() {
            Backbone.history.start({
                pushState: true,
                root: "/"
            });
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