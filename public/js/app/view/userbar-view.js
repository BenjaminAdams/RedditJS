define(['App', 'jquery', 'underscore', 'backbone', 'hbs!template/userbar', 'view/basem-view', 'model/user-about', 'cookie'],
	function(App, $, _, Backbone, UserbarTmpl, BaseView, UserModel, Cookie) {
		return BaseView.extend({
			template: UserbarTmpl,
			events: {
				'click .logout': 'logout'
			},
			ui: {
				'loggedIn': '#loggedIn',
				'loggedOut': '#loggedOut',
				'mail': '#mail'
			},

			initialize: function(data) {
				_.bindAll(this);
				var self = this

				if (this.checkIfLoggedIn() === true) {
					var localstorageUsr = $.totalStorage('userinfo')
					this.model = new UserModel(localstorageUsr);
				}
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

				if (window.production == false) {
					console.log('apennding to mail')
					var str = '<a class="pref-lang" href="/test">test </a> | '
					this.ui.mail.before(str)
				}
			},
			showLoggedIn: function() {
				this.model = new UserModel($.cookie('username'));
				this.model.fetch({
					success: this.updateUserInfo
				})
				//this.listenTo(this.model, 'sync', this.updateUserInfo)
				//this.render()
				this.ui.loggedOut.hide()
				this.ui.loggedIn.show()

			},
			showLoggedOut: function() {
				//this.$el.html(this.loggedOut)
				this.ui.loggedOut.show()
				this.ui.loggedIn.hide()
				//$(this.el).html(this.loggedOut)
			},
			updateUserInfo: function() {
				$.totalStorage('userinfo', this.model.attributes)
				this.render()
			},
			logout: function(e) {
				e.preventDefault()
				e.stopPropagation()
				App.trigger("logout");
				this.showLoggedOut()
			}
		});

	});