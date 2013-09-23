/**
 * Extended validation callbacks for a twitter boostrap form (control-group, etc.)
 * Override or make your own if your template is different
 *
 * Author: Baptiste Meurant <baptiste.meurant@gmail.com>
 * Date: 23/08/12
 * Time: 16:57
 */

(function(factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('jquery', 'backbone', 'backbone-validation-orig'));
    } else if (typeof define === 'function' && define.amd) {
        define(['jquery', 'backbone', 'backbone-validation-orig'], factory);
    }
}(function($, Backbone) {

    /**
     * Backbone Validation extension: Defines custom callbacks for valid and invalid
     * model attributes
     */
    _.extend(Backbone.Validation.callbacks, {
        valid: function(view, attr, selector) {

            // find matching form input and remove error class and text if any
            var attrSelector = '[' + selector + '~="' + attr + '"]';
            // get the control group element
            view.$(attrSelector).closest('.control-group').removeClass('error');
            // get the controls element
            view.$(attrSelector).closest('.control-group').find('.help-inline').text('');
            view.$(attrSelector).closest('.control-group').find('.help-inline').hide();
        },
        invalid: function(view, attr, error, selector) {

            // find matching form input and add error class and text error
            var attrSelector = '[' + selector + '~="' + attr + '"]';
            // get the control group element
            view.$(attrSelector).closest('.control-group').addClass('error');
            // get the controls element
            view.$(attrSelector).closest('.control-group').find('.help-inline').text(error);
            view.$(attrSelector).closest('.control-group').find('.help-inline').show();
        }
    });

    return Backbone.Validation;

}));
