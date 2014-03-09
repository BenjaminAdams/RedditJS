/* test.js View

A playground

*/
define(['App', 'underscore', 'backbone', 'hbs!template/embed', 'view/basem-view'],
    function(App, _, Backbone, Tmpl, BaseView, SubredditCollection) {
        return BaseView.extend({
            template: Tmpl,
            events: {
                'change input': 'updateSettings'
            },
            ui: {
                load1000: '#load1000'
            },
            initialize: function(options) {
                _.bindAll(this);
                //this.model = null

            },
            onRender: function() {
                //hide the header with CSS because I am not sure if we still need it or not
                //TODO: Do I really need it?
                $('#theHeader').hide()

            },
            onBeforeClose: function() {
                $('#theHeader').show()
            }

        });
    });