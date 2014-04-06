require.config({
    baseUrl: "./js/app",
    paths: {
        // Core Libraries
        "jquery": "../lib/jquery",
        //'underscore': '../lib/underscore',
        'underscore': '../lib/lodash2.4.1',
        "backbone": "../lib/backbone",
        "marionette": "../lib/marionette",
        "hbs": "../lib/hbs",
        "json2": "../lib/json2",
        "jszip": '../lib/jszip',
        "fileSaver": '../lib/fileSaver',
        'cookie': '../lib/jquery.cookie',
        'localstorage': '../lib/jquery.total-storage',
        'moment': '../lib/moment',
        'console': '../lib/console'
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
        // Handlebars
        "handlebars": {
            "exports": "Handlebars"
        },
        "cookie": ["jquery"],
        "localstorage": ["jquery"]

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