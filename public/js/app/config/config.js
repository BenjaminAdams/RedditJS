require.config({
    baseUrl: "./js/app",
    // 3rd party script alias names (Easier to type "jquery" than "libs/jquery, etc")
    // probably a good idea to keep version numbers in the file names for updates checking
    paths: {
        // Core Libraries
        "jquery": "../lib/jquery",
        "jqueryui": "../lib/jqueryui",
        "jquerymobile": "../lib/jquery.mobile",
        //  "underscore": "../lib/lodash",
        'underscore': '../lib/underscore',
        'underscore-string': '../lib/underscore-string',
        "backbone": "../lib/backbone",
        "marionette": "../lib/backbone.marionette",
        'handlebars': '../lib/handlebars',
        //   'handlebars': '../lib/resthub/handlebars-helpers',
        // "handlebars": "../lib/handlebars",
        "hbs": "../lib/hbs",
        // hbs: '../lib/resthub/require-handlebars', //CHANGE THIS to the /lib/hbs when you remove resthub 
        'resthub': '../lib/resthub/resthub',
        //  template: '../app/template', //from resthub
        "i18nprecompile": "../lib/i18nprecompile",
        "json2": "../lib/json2",
        "jasmine": "../lib/jasmine",
        "jasmine-html": "../lib/jasmine-html",
        // "screenleap": "http://api.screenleap.com/js/screenleap",
        'cookie': '../lib/jquery.cookie',
        'moment': '../lib/moment',
        'console': '../lib/resthub/console',
        // Plugins
        "backbone.validateAll": "../lib/plugins/Backbone.validateAll",
        "bootstrap": "../lib/plugins/bootstrap",
        "text": "../lib/plugins/text",
        //  "bootbox": "../lib/bootbox",
        "jasminejquery": "../lib/plugins/jasmine-jquery"
    },
    // Sets the configuration for your third party scripts that are not AMD compatible
    shim: {
        'underscore': {
            exports: '_'
        },
        // Twitter Bootstrap jQuery plugins
        "bootstrap": ["jquery"],
        // jQueryUI
        "jqueryui": ["jquery"],
        // jQuery mobile
        "jquerymobile": ["jqueryui"],

        // Backbone
        "backbone": {
            // Depends on underscore/lodash and jQuery
            "deps": ["underscore", "jquery"],
            // Exports the global window.Backbone object
            "exports": "Backbone"
        },
        'underscore-string': {
            deps: [
                'underscore'
            ]
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
        // 'handlebars-orig': {
        //     exports: 'Handlebars' //from resthub
        // },
        // Backbone.validateAll plugin that depends on Backbone
        "backbone.validateAll": ["backbone"],

        "jasmine": {
            // Exports the global 'window.jasmine' object
            "exports": "jasmine"
        },
        // "bootbox": {
        //     // Depends on underscore/lodash and jQuery
        //     "deps": ["underscore", "jquery"],
        //     // Exports the global window.Backbone object
        //     "exports": "Bootbox"
        // },

        "jasmine-html": {
            "deps": ["jasmine"],
            "exports": "jasmine"
        },
        "cookie": ["jquery"]
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