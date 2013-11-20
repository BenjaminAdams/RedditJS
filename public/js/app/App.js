//code from https://github.com/BoilerplateMVC/Marionette-Require-Boilerplate

define(['jquery', 'backbone', 'marionette', 'underscore', 'handlebars'],
    function($, Backbone, Marionette, _, Handlebars) {
        var App = new Backbone.Marionette.Application();

        //Organize Application into regions corresponding to DOM elements
        //Regions can contain views, Layouts, or subregions nested as necessary
        App.addRegions({
            headerRegion: "#theHeader",
            // mainRegion: "#main",
            mainRegion: ".content",
            popupRegion: "#popupWindow",
            sidebarRegion: '.side',
            bottombarRegion: '#bottom-bar-container '
        });

        App.addInitializer(function() {
            // Backbone.history.start();

            var pushState = !! (window.history && window.history.pushState),
                settings = {
                    pushState: pushState
                };
            Backbone.history.start(settings);

        });

        //prevent page reload
        $(window.document).on('click', 'a[href]:not([data-bypass])', function(evt) {
            var protocol = this.protocol + '//';
            var href = this.href;
            href = href.slice(protocol.length);
            href = href.slice(href.indexOf("/") + 1);

            if (href.slice(protocol.length) !== protocol) {
                evt.preventDefault();
                Backbone.history.navigate(href, true);
            }
        });

        return App;
    });