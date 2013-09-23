define(['module'], function(module) {

    var masterConfig = (module.config && module.config()) || {};

    var hbs = {
        load: function (name, req, load, config) {
            config = config || {};
            
            var extension = masterConfig.extension;
            if (config.extension) {
                extension = config.extension;
            }
            extension = extension || 'hbs';
            var textName = 'text!' + name + '.' + extension;

            return req(['handlebars', textName], function (Handlebars, template) {
                if(!config.isBuild) {
                    load(Handlebars.compile(template));
                }
                else {
                    load(template);
                }
            });
        }
    };

    return hbs;
});
