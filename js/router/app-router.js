define([ 'underscore', 'backbone', 'view/subreddit-view','backbone-queryparams'], function(_,Backbone, SubredditView) {

    var AppRouter = Backbone.Router.extend({
        
        initialize: function() {
            Backbone.history.start({ pushState: true, root: "/" });
        },
        
        routes: {
            '': 'main',
            'r/:subname': 'subreddit'
        },
        
        main: function() {
            console.debug("Main route activated");
			subredditView = new SubredditView({subname:"front"});
        },

        subreddit: function(subname) {
            console.debug("subreddit route for "+subname+"activated");
			subredditView = new SubredditView({subname:subname});

        }
    });
    
    return AppRouter;

});
