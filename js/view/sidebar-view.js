define(['jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/sidebar', 'view/base-view', 'view/login-view', 'view/header-view', 'model/sidebar', 'cookie'],
	function($, _, Backbone, Resthub, SidebarTmpl, BaseView, LoginView, HeaderView, SidebarModel, Cookie) {
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

				//now render the login view
				this.loginView.render()

				HeaderView.updateHeader(this.model)

			},

		});
		return SidebarView;
	});