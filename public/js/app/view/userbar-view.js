define(['App', 'jquery', 'underscore', 'backbone', 'hbs!template/userbar', 'view/basem-view', 'model/user-about', 'cookie'],
	function(App, $, _, Backbone, UserbarTmpl, BaseView, UserModel, Cookie) {
		return BaseView.extend({
			template: UserbarTmpl,
			events: {
				//  'keyup #new-todo':     'showTooltip'
				'click .logout': 'logout'
			},
			ui: {
				'loggedIn': '#loggedIn',
				'loggedOut': '#loggedOut'
			},
			initialize: function(data) {
				_.bindAll(this);
				var self = this

				//this.loggedOut = '<div id="userbar-logged-out"><span class="user">want to join? <a class="login-required" href="#">login or register</a> in seconds</span></div>'
				this.model = new UserModel($.cookie('username'));
				App.on("login", this.showLoggedIn, this);

			},
			onRender: function() {

				//this.showLoggedOut();
				if (this.checkIfLoggedIn() === true) {
					//this.showLoggedIn()
					//this.getMyStatus()
					this.ui.loggedOut.hide()
					this.ui.loggedIn.show()
				} else {
					//this.render();
					this.showLoggedOut()
				}
			},

			showLoggedIn: function() {
				this.model = new UserModel($.cookie('username'));
				this.listenTo(this.model, 'sync', this.render)
				this.render()
				this.ui.loggedOut.hide()
				this.ui.loggedIn.show()

			},
			showLoggedOut: function() {
				//this.$el.html(this.loggedOut)
				this.ui.loggedOut.show()
				this.ui.loggedIn.hide()
				//$(this.el).html(this.loggedOut)
			},
			logout: function(e) {
				e.preventDefault()
				e.stopPropagation()
				App.trigger("logout");
				this.showLoggedOut()
			}
		});

	});