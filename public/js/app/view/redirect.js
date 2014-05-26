define(['App', 'jquery', 'underscore', 'backbone', 'view/basem-view', 'hbs!template/blank', 'cookie'],
	function(App, $, _, Backbone, BaseView, Tmpl, Cookie) {
		return BaseView.extend({
			template: Tmpl,

			initialize: function(data) {
				_.bindAll(this);
			},
			onRender: function() {
				window.close()
			}

		});

	});