//code from https://github.com/BoilerplateMVC/Marionette-Require-Boilerplate
define(['jquery', 'backbone', 'marionette', 'underscore'],
    function($, Backbone, Marionette, _) {
        var App = new Backbone.Marionette.Application();

        //bootstrap the user variable
        App.user = window.redditUser || false
        App.baseURL = 'https://reddit.com/'
        //#reqAsBot
        if (window.location.hash) {
            var hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
            if (hash === "reqAsBot") {
                var fetchBots = ['http://robot85.herokuapp.com/', 'http://robot86.herokuapp.com/', 'http://robot87.herokuapp.com/']
                var bot = fetchBots[Math.floor((Math.random() * fetchBots.length))]
                App.baseURL = bot + 'api/'

                //App.settings.set('btmbar', false)
            }

        }

        //the width to strart showing mobile
        App.mobileWidth = 900;
        App.isMobile = function() {
            if ($(document).width() > App.mobileWidth) {
                return false
            } else {
                return true
            }
        }

        //if our server side returns a 419 error, have them login again with reddit oauth
        $(document).ajaxError(function(event, jqxhr, settings, exception) {
            if (jqxhr.status === 419) {
                console.log('show them login msg')
                App.trigger('oauth:showPopup')
            }
        });

        //Organize Application into regions corresponding to DOM elements
        //Regions can contain views, Layouts, or subregions nested as necessary
        App.addRegions({
            headerRegion: "#theHeader",
            mainRegion: "#content",
            popupRegion: "#popupWindow",
            sidebarRegion: '.side',
            bottombarRegion: '#bottom-bar-container '
        });

        App.addInitializer(function() {
            var pushState = !!(window.history && window.history.pushState),
                settings = {
                    pushState: pushState
                };
            Backbone.history.start(settings);
        });

        //prevent page reload
        $(window.document).on('click', 'a[href]:not([data-bypass])', function(e) {
            if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
                var protocol = this.protocol + '//';
                var href = this.href;
                href = href.slice(protocol.length);
                href = href.slice(href.indexOf("/") + 1);

                if (href.slice(protocol.length) !== protocol) {
                    e.preventDefault();
                    Backbone.history.navigate(href, true);
                }
            }
        });

        return App;
    });