//code from https://github.com/BoilerplateMVC/Marionette-Require-Boilerplate
define(['jquery', 'backbone', 'marionette', 'underscore', 'cookie', 'global'],
  function($, Backbone, Marionette, _, cookie) {
    var App = new Backbone.Marionette.Application();

    //bootstrap the user variable
    App.user = window.redditUser || false
    App.baseURL = 'https://www.reddit.com/'
    App.embedId = 0 //use this ID to pass messages back and forth between widget and main frame
    App.isEmbeded = false
    App.slideShowSpeed = $.cookie('slideShowSpeed') || 8000
    App.slideShowPaused = $.cookie('slideShowPaused') || false
    App.slideShowPaused = parseBool(App.slideShowPaused) //storing a bool in a cookie will convert it to a string

    //#reqAsBot
    if (window.location.hash) {
      var hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
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
      bottombarRegion: '#bottom-bar-container',
      fullscreenSlideShow: '#fullscreenSlideShow'
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

      if (typeof e.target.src !== 'undefined' && e.target.src.indexOf("projectwonderful") > -1) {
        //do not capture clicks in ad
        return true;
      }

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

    function parseBool(value) {
      if (typeof value === "boolean") return value;

      if (typeof value === "number") {
        return value === 1 ? true : value === 0 ? false : undefined;
      }

      if (typeof value != "string") return undefined;

      return value.toLowerCase() === 'true' ? true : false;
    }

    return App;
  });
