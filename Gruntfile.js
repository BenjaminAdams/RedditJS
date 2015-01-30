var fs = require('fs')

module.exports = function(grunt) {

    fs.writeFile('timestamp.json', JSON.stringify({
        timestamp: Date.now()
    }), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("timestamp saved");
        }
    });

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {

            mainJS: {
                options: {
                    baseUrl: "public/js/app",
                    "findNestedDependencies": true,
                    wrap: true,
                    // Cannot use almond since it does not currently appear to support requireJS's config-map
                    //name: "../lib/almond",
                    preserveLicenseComments: false,
                    optimize: "uglify",
                    wrapShim: true,
                    hbs: {
                        disableI18n: true,
                        disableHelpers: true,
                        templateExtension: "html",
                        //  helperDirectory: "template/helpers/",
                        //  i18nDirectory: "template/i18n/",

                        compileOptions: {} // options object which is passed to Handlebars compiler
                    },
                    mainConfigFile: "public/js/app/config/config.js",
                    include: ["init/main"],
                    out: "public/js/app/init/main.min.js"
                }
            },
            mainCSS: {
                options: {
                    optimizeCss: "standard",
                    cssIn: "./public/css/styles.css",
                    out: "./public/css/styles.min.css"
                }
            },
            darkCSS: {
                options: {
                    optimizeCss: "standard",
                    cssIn: "./public/css/dark/styles.css",
                    out: "./public/css/dark/styles.min.css"
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'public/js/app/**/*.js', '!public/js/app/**/*min.js'],
            options: {
                asi: true,
                globals: {
                    jQuery: true,
                    console: false,
                    module: true,

                    document: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.registerTask('test', ['jshint']);
    grunt.registerTask('build', ['requirejs:mainJS', 'requirejs:mainCSS', 'requirejs:darkCSS']);
    grunt.registerTask('default', ['test', 'build']);
};