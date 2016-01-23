// Requirejs-tmpl plugin inspired by https://github.com/requirejs/text
// Templating inspired by http://underscorejs.org/#template
// Yuanyan(yuanyan.cao@gmail.com) MIT. 

define(['module'], function(module) {

    'use strict';

    var masterConfig = (module.config && module.config()) || {};
    var masterConfigTemplateSetting = masterConfig.templateSetting || {};

    // By default, Underscore uses ERB-style template delimiters, change the
    // following template settings to use alternative delimiters.
    var templateSettings = {
        evaluate: masterConfigTemplateSetting.evaluate || /<%([\s\S]+?)%>/g,
        interpolate: masterConfigTemplateSetting.interpolate || /<%=([\s\S]+?)%>/g,
        escape: masterConfigTemplateSetting.escape || /<%-([\s\S]+?)%>/g,
        include: masterConfigTemplateSetting.include || /<%@([\s\S]+?)%>/g
    };

    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    var noMatch = /(.)^/;

    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\t': 't',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };

    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
    var defaultEscape = function(s) {
        return s.replace(/[<>\"\'/]/g, function(m) {
            return {
                '<': '&lt;',
                '>': '&gt;',
                '\"': '&quot;',
                '\'': '&#x27;',
                '/': '&#x2F;'
            }[m]
        })
    };

    // Template include cache.
    var partials = {};

    var templating = function(text, data, settings) {

        var render;
        settings = settings || templateSettings;

        // Combine delimiters into one regular expression via alternation.
        var matcher = new RegExp([
            (settings.include || noMatch).source, (settings.escape || noMatch).source, (settings.interpolate || noMatch).source,
            // evaluate regexp should be last
            (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        var hasEscape = false;
        text.replace(matcher, function(match, include, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset)
                .replace(escaper, function(match) {
                    return '\\' + escapes[match];
                });

            if (include) {
                // Default include format is <%@ header.html:context %>
                var includes = include.replace(/^\s+/, "").replace(/\s+$/, "").split(":");
                var context = includes[1] || '';
                // Partials must be ready before
                source += "'+\n(" + partials[includes[0]] + ")(" + context + ")+\n'";
            }
            if (escape) {
                hasEscape = true;
                source += "'+\n((__t=(" + escape + "))==null?'':__e(__t))+\n'";
            }
            if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            }
            if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }

            index = offset + match.length;
            return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function(){__p+=__j.call(arguments,'');};\n" +
            (hasEscape ? ("var __e=" + (settings.escaper ? settings.escaper : defaultEscape) + ";\n") : '') +
            source + "return __p;\n";

        try {
            render = new Function(settings.variable || 'obj', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        if (data) return render(data);
        var template = function(data) {
            return render.call(this, data);
        };

        // Provide the compiled function source as a convenience for precompilation.
        template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';
        return template;
    };

    var tmpl, fs,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        templateStore = {},
        DOT_RE = /\/\.\//g,
        DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//,
        DOUBLE_SLASH_RE = /([^:/])\/\//g;

    // Normalize method inspired by https://github.com/seajs/seajs/blob/master/src/util-path.js
    function normalize(path) {
        // /a/b/./c/./d ==> /a/b/c/d
        path = path.replace(DOT_RE, "/")
        // a//b/c  ==>  a/b/c
        path = path.replace(DOUBLE_SLASH_RE, "$1/")
        return path
    }

    tmpl = {
        version: '1.2.0',

        createXhr: masterConfig.createXhr || function() {
            // Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId]; // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext
         *
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext"
         * where strip is a boolean.
         */
        parseName: function(name) {
            var modName, ext, temp,
                index = name.indexOf("."),
                isRelative = name.indexOf('./') === 0 ||
                    name.indexOf('../') === 0;

            if (index !== -1 && (!isRelative || index > 1)) {
                modName = name.substring(0, index);
                ext = name.substring(index + 1, name.length);
            } else {
                modName = name;
            }

            temp = ext || modName;
            index = temp.indexOf("!");
            if (index !== -1) {
                // Pull off the strip arg.
                temp = temp.substring(0, index);
                if (ext) {
                    ext = temp;
                } else {
                    modName = temp;
                }
            }

            return {
                moduleName: modName,
                ext: ext
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a tmpl resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function(url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort,
                match = tmpl.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                ((!uPort && !uHostName) || uPort === port);
        },

        finishLoad: function(name, content, onLoad) {

            var precompile = templating(content);
            templateStore[name] = precompile.source;
            onLoad(precompile);
        },

        load: function(name, require, onLoad, config) {
            // Name has format: some.module.html

            masterConfig.isBuild = config.isBuild;

            var parsed = tmpl.parseName(name),
                parsedName = parsed.moduleName +
                    (parsed.ext ? '.' + parsed.ext : ''),
                url = require.toUrl(parsedName),
                useXhr = (masterConfig.useXhr) ||
                    tmpl.useXhr;

            // same origin check
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                tmpl.get(url, function(content) {
                    var matches, originIncludes = [],
                        includes = [];
                    while ((matches = templateSettings.include.exec(content)) !== null) {
                        // include name trim
                        var include = matches[1].replace(/^\s+/, "").replace(/\s+$/, "").split(":")[0];
                        // TODO: throw error when include empty
                        originIncludes.push(include);
                        // includes.push('tmpl!' + require.toUrl(include) );

                        if (name.split('/')[0]) {
                            // Extract the directory portion of a path
                            // "a/b/c.js?t=123#xx/zz" ==> "a/b/"
                            // ref: http://jsperf.com/regex-vs-split/2
                            var dirname = name.match(/[^?#]*\//)[0];
                            include = normalize(dirname + include);
                        }

                        includes.push('tmpl!' + include);
                    }

                    if (includes[0]) {
                        require(includes, function() {
                            for (var i = 0, l = includes.length; i < l; i++) {
                                partials[originIncludes[i]] = templateStore[includes[i].slice(5)];
                            }
                            tmpl.finishLoad(name, content, onLoad);
                        });
                    } else {
                        tmpl.finishLoad(name, content, onLoad);
                    }

                }, function(err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                // Need to fetch the resource across domains. Assume
                // the resource has been optimized into a JS module. Fetch
                // by the module name + extension, but do not include the
                // !strip part to avoid file system issues.
                require([parsedName], function(content) {
                    tmpl.finishLoad(parsed.moduleName + '.' + parsed.ext,
                        content, onLoad);
                });
            }
        },

        // For r.js
        write: function(pluginName, moduleName, write, config) {
            if (templateStore.hasOwnProperty(moduleName)) {
                var source = templateStore[moduleName];
                write.asModule(pluginName + "!" + moduleName,
                    "define(function () { return " +
                    source +
                    ";});\n");
            }
        },

        writeFile: function(pluginName, moduleName, req, write, config) {
            var parsed = tmpl.parseName(moduleName),
                extPart = parsed.ext ? '.' + parsed.ext : '',
                parsedName = parsed.moduleName + extPart,
                // Use a '.js' file name so that it indicates it is a
                // script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + extPart) + '.js';

            // Leverage own load() method to load plugin value, but only
            // write out values that do not have the strip argument,
            // to avoid any potential issues with ! in file names.
            tmpl.load(parsedName, req, function(value) {
                // Use own write() method to construct full module value.
                // But need to create shell that translates writeFile's
                // write() to the right interface.
                var textWrite = function(contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function(moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                tmpl.write(pluginName, parsedName, textWrite, config);
            }, config);
        }
    };

    // Node.js
    if (masterConfig.env === 'node' || (!masterConfig.env &&
        typeof process !== "undefined" &&
        process.versions && !! process.versions.node && !process.versions['node-webkit'])) {
        // Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        tmpl.get = function(url, callback) {
            var file = fs.readFileSync(url, 'utf8');
            // Remove BOM (Byte Mark Order) from utf8 files if it is there.
            if (file.indexOf('\uFEFF') === 0) {
                file = file.substring(1);
            }

            // safe removing whitespace and line endings using regexp
            file = file.replace(/>\s+</g, "> <");

            callback(file);
        };

        // Browser
    } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
        tmpl.createXhr())) {
        tmpl.get = function(url, callback, errback, headers) {
            var xhr = tmpl.createXhr(),
                header;

            // Default synchronous AJAX
            // var async = !!masterConfig.async;
            xhr.open('GET', url, true);

            // Allow plugins direct access to xhr headers
            if (headers) {
                for (header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header.toLowerCase(), headers[header]);
                    }
                }
            }

            // Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function(evt) {
                var status, err;
                // Do not explicitly handle errors, those should be
                // visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        errback(err);
                    } else {
                        // safe removing whitespace and line endings using regexp
                        callback(xhr.responseText.replace(/>\s+</g, "> <"));
                    }

                    if (masterConfig.onXhrComplete) {
                        masterConfig.onXhrComplete(xhr, url);
                    }
                }
            };

            xhr.send(null);

        };
    }
    return tmpl;
});