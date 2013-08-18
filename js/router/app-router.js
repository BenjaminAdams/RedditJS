define(['jquery', 'underscore', 'backbone', 'view/subreddit-view','backbone-queryparams'], function($,_,Backbone, SubredditView) {



    var AppRouter = Backbone.Router.extend({
        
        initialize: function() {
            Backbone.history.start({ pushState: true, root: "/" });
        },
        
        routes: {
            '': 'main',
			'r': 'subreddit',
            'r/*': 'subreddit'
        },
        
        main: function() {
            console.debug("Main route activated");
        },

        subreddit: function() {
            console.debug("subreddit route activated");
			subredditView = new SubredditView();

        }
    });
    
    return AppRouter;

});
