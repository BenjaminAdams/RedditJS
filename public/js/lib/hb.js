define(['text', 'handlebars'], function(text, handlebarsImport) {

    var handlebars = handlebarsImport['default'],
        buildCache = {},
        buildCompileTemplate = 'define("{{pluginName}}!{{moduleName}}", ["handlebars"], function(handlebars) {return handlebars.template({{{fn}}})});',
        buildTemplate;

    var load = function(moduleName, parentRequire, load, config) {

        text.load(moduleName + '.html', parentRequire, function(data) {

            if (config.isBuild) {
                buildCache[moduleName] = data;
                load();
            } else {
                load(handlebars.compile(data));
            }
        }, config);
    };

    var write = function(pluginName, moduleName, write) {

        if (!handlebars.precompile && require.nodeRequire) {
            try {
                handlebars = require.nodeRequire('handlebars');
            } catch (error) {
                process.stdout.write("\nLooks like the runtime version of Handlebars is used.\n");
                process.stderr.write("Install handlebars with npm to precompile templates: npm install handlebars --save-dev\n\n");
            }
        }

        if (moduleName in buildCache) {

            if (!buildTemplate) {
                buildTemplate = handlebars.compile(buildCompileTemplate);
            }

            write(buildTemplate({
                pluginName: pluginName,
                moduleName: moduleName,
                fn: handlebars.precompile(buildCache[moduleName])
            }));
        }
    };

    return {
        load: load,
        write: write
    };
});