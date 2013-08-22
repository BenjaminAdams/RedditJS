define(['underscore', 'backbone', 'view/subreddit-view', 'view/header-view', 'event/channel', 'backbone-queryparams'], function(_, Backbone, SubredditView, HeaderView, channel) {

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
            subredditView = new SubredditView({
                subName: subName
            });

        }
    });

    return AppRouter;

});