define(['handlebars'], function(Handlebars) {
    function yeller(context, options) {
        // Assume it's a string for simplicity.
        return context + "!!!!!!!!";
    }

    Handlebars.registerHelper('yeller', yeller);
    return yeller;
});