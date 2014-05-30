define(['App', 'jquery', 'underscore', 'backbone', 'view/basem-view', 'hbs!template/blank', 'cookie'],
	function(App, $, _, Backbone, BaseView, Tmpl, Cookie) {
		return BaseView.extend({
			template: Tmpl,

			initialize: function(data) {
				_.bindAll(this);
			},
			onRender: function() {
				//delete users subreddits so we can fetch again
				_.invoke(App.subreddits.mine.toArray(), 'destroy');
				//query the api for /me.json
				$.totalStorage('subreddits', null);

				window.close()
			}

		});

	});