require.config({
    baseUrl: "./js/app",
    paths: {
        // Core Libraries
        "jquery": "../lib/jquery",
        // 'underscore': '../lib/underscore',
        //'underscore': '../lib/lazy',
        //'underscore': '../lib/lodash',
        'underscore': '../lib/lodash2.4.1',
        "backbone": "../lib/backbone",
        //"marionette": "../lib/marionette",
        //"marionette": "../lib/marionettev1.2.3",
        "marionette": "../lib/marionette.1.5.1",
        //'fasterCollectioView': '../lib/marionette.FasterCollectionView',
        /* original handlebars setup */
        'handlebars': '../lib/handlebars',
        "hbs": "../lib/hbs",
        /* end setup */

        /* test handlebars setup */
        // 'handlebars': '../lib/handlebars.amd',
        // 'handlebars.runtime': '../lib/handlebars.runtime',
        // "hbs": "../lib/hb",
        /* end setup */

        //"tmpl": "../lib/tmpl",
        "i18nprecompile": "../lib/i18nprecompile",
        "json2": "../lib/json2",
        "jszip": '../lib/jszip',
        "fileSaver": '../lib/fileSaver',
        //  "jasmine": "../lib/jasmine",
        // "jasmine-html": "../lib/jasmine-html",
        'cookie': '../lib/jquery.cookie',
        'localstorage': '../lib/jquery.total-storage',
        'moment': '../lib/moment',
        'console': '../lib/console',
        text: '../lib/text'
        //"backbone.validateAll": "../lib/plugins/Backbone.validateAll",
        //"bootstrap": "../lib/plugins/bootstrap",
        //"wookmark": "../lib/jquery.wookmark",
        //   "imagesLoaded": "../lib/imagesLoaded",
        //"jasminejquery": "../lib/plugins/jasmine-jquery"
    },
    // Sets the configuration for your third party scripts that are not AMD compatible
    shim: {
        'underscore': {
            exports: '_'
        },
        // Backbone
        "backbone": {
            // Depends on underscore/lodash and jQuery
            "deps": ["underscore", "jquery"],
            // Exports the global window.Backbone object
            "exports": "Backbone"
        },
        //Marionette
        "marionette": {
            "deps": ["underscore", "backbone", "jquery"],
            "exports": "Marionette"
        },
        //fasterCollectioView
        //'fasterCollectioView': {
        //"deps": ["underscore", "backbone", "jquery", 'marionette']
        //},
        // Handlebars
        "handlebars": {
            "exports": "Handlebars"
        },
        "cookie": ["jquery"],
        "localstorage": ["jquery"]
        //"jasmine": {
        // Exports the global 'window.jasmine' object
        //"exports": "jasmine"
        //},
        //"jasmine-html": {
        // "deps": ["jasmine"],
        //"exports": "jasmine"
        //},

    },

    // hbs config - must duplicate in Gruntfile.js Require build
    hbs: {
        disableI18n: true,
        disableHelpers: true,
        templateExtension: "html",
        //  helperDirectory: "template/helpers/",
        //  i18nDirectory: "template/i18n/",

        compileOptions: {} // options object which is passed to Handlebars compiler
    }
});