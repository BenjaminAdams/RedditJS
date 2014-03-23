//code from https://github.com/BoilerplateMVC/Marionette-Require-Boilerplate
define(['jquery', 'backbone', 'marionette', 'underscore'],
    function($, Backbone, Marionette, _) {
        var App = new Backbone.Marionette.Application();

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

                oauthPopup({
                    path: '/login',
                    callback: function() {
                        console.log('callback');
                        window.location.reload();
                        //do callback stuff
                    }
                });

            }
        });

        //Organize Application into regions corresponding to DOM elements
        //Regions can contain views, Layouts, or subregions nested as necessary
        App.addRegions({
            headerRegion: "#theHeader",
            // mainRegion: "#main",
            mainRegion: "#content",
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

//from http://www.jquery4u.com/social-networking/oauth-popup-window/
function oauthPopup(options) {
    options.windowName = options.windowName || 'Login with Reddit'; // should not include space for IE
    options.windowOptions = options.windowOptions || 'location=0,status=0,width=800,height=700';
    var that = this;
    console.log(options.path);
    that._oauthWindow = window.open(options.path, options.windowName, options.windowOptions);
    that._oauthInterval = window.setInterval(function() {
        if (that._oauthWindow.closed) {
            window.clearInterval(that._oauthInterval);
            options.callback();
        }
    }, 1000);
}