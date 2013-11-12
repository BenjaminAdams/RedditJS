//code from https://github.com/BoilerplateMVC/Marionette-Require-Boilerplate

define(['jquery', 'backbone', 'marionette', 'underscore', 'handlebars'],
    function($, Backbone, Marionette, _, Handlebars) {
        var App = new Backbone.Marionette.Application();

        //Organize Application into regions corresponding to DOM elements
        //Regions can contain views, Layouts, or subregions nested as necessary
        App.addRegions({
            headerRegion: "theHeader",
            // mainRegion: "#main",
            mainRegion: ".content",
            popupRegion: "#popupWindow",
            sidebarRegion: '.side'
        });

        App.addInitializer(function() {
            // Backbone.history.start();

            var pushState = !! (window.history && window.history.pushState),
                settings = {
                    pushState: pushState
                };
            Backbone.history.start(settings);

        });

        //move this somewhere else later
        // window.Handlebars.registerHelper('select', function(value, options) {
        //     var $el = $('<select />').html(options.fn(this));
        //     $el.find('[value=' + value + ']').attr({
        //         'selected': 'selected'
        //     });
        //     return $el.html();
        // });

        return App;
    });