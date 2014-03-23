define(['App', 'jquery', 'underscore', 'backbone', 'hbs!template/userbar', 'view/basem-view', 'model/user-about', 'hbs!template/userbar-mobile', 'cookie', 'localstorage'],
	function(App, $, _, Backbone, UserbarTmpl, BaseView, UserModel, MobileUserbarTmpl, Cookie, Localstorage) {
		return BaseView.extend({
			template: UserbarTmpl,
			events: {
				'click .logout': 'logout',
				'click #userbar-logged-out': 'showOathLogin'
				//'click #signInUserbar': 'showOathLogin'
			},
			ui: {
				'loggedIn': '#loggedIn',
				'loggedOut': '#loggedOut',
				'mail': '#mail'
			},

			initialize: function(data) {
				_.bindAll(this);
				var self = this

				if (data.mobile === true) {
					this.template = MobileUserbarTmpl
					this.tagName = 'span'
				}

				if (this.checkIfLoggedIn() === true) {
					this.model = new UserModel(App.user);
					console.log('model=', this.model)
				}

			},
			onRender: function() {
				if (this.checkIfLoggedIn() === true) {
					this.ui.loggedOut.hide()
					this.ui.loggedIn.show()
				} else {
					this.showLoggedOut()
				}

				if (window.production === false) {
					var str = '<a class="pref-lang" href="/test" title="test"><i class="fa fa-truck"></i></a>'
					this.ui.mail.before(str)
				}
			},

			showOathLogin: function() {
				console.log('show oath login form')
				this.showLoginBox()
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

				$.get("/logout");

				$.totalStorage.deleteItem('subreddits')

			}
		});

	});