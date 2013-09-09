/* Prefs-view.js View

Change site settings

*/
define(['underscore', 'backbone', 'resthub', 'hbs!template/prefs', 'view/base-view', 'event/channel'],
	function(_, Backbone, Resthub, PrefsTmpl, BaseView, channel) {
		var PrefsView = BaseView.extend({
			//strategy: 'append',
			el: $(".content"),
			template: PrefsTmpl,
			events: {
				'submit #newlink': "submitForm",
				'click .link-button': 'changeToLink',
			},

			initialize: function(options) {
				_.bindAll(this);
				this.$el.empty()

				this.model = new Backbone.Model({
					subName: this.subName
				})

				this.render();

			},

		});
		return PrefsView;
	});