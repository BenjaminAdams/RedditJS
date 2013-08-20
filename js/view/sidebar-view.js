define(['jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/sidebar', 'view/base-view', 'view/login-view', 'model/sidebar', 'cookie'],
	function($, _, Backbone, Resthub, SidebarTmpl, BaseView, LoginView, SidebarModel, Cookie) {
		var SidebarView = BaseView.extend({
			events: {
				//  'keyup #new-todo':     'showTooltip'
			},

			initialize: function(data) {
				_.bindAll(this);
				this.template = SidebarTmpl;
				this.model = new SidebarModel(data.subName)

				// this.render();
				this.model.fetch({
					success: this.loaded
				});

				// this.$() is a shortcut for this.$el.find().

			},
			loaded: function(response, sidebar) {
				this.render()

				this.loginView = new LoginView({
					root: "#theLogin"
				})
				this.loginView.render()

				//now render the login view

			},

		});
		return SidebarView;
	});