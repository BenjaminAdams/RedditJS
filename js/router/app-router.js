define(['jquery', 'underscore', 'backbone', 'view/beers-view','backbone-queryparams','jqueryvideo'], function($,_,Backbone, BeersView,Jqueryvideo) {

	  $('body').videoBG({
		position:"fixed",
		zIndex:-1,
		mp4:'http://shimer.troll.me/js/lib/jquery-video/assets/christmas_snow.mp4',
		ogv:'http://shimer.troll.me/js/lib/jquery-video/assets/christmas_snow.ogv',
		webm:'http://shimer.troll.me/js/lib/jquery-video/assets/christmas_snow.webm',
		poster:'http://shimer.troll.me/js/lib/jquery-video/assets/christmas_snow.jpg',
		opacity:0.5
	});


    var AppRouter = Backbone.Router.extend({
        
        initialize: function() {
            Backbone.history.start({ pushState: true, root: "/" });
        },
        
        routes: {
            '': 'main',
            'beers': 'beers'
        },
        
        main: function() {
            console.debug("Main route activated");
        },

        beers: function() {
            console.debug("beers route activated");
			beersView = new BeersView();

        }
    });
    
    return AppRouter;

});
