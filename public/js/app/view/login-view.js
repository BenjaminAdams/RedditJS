define(['App', 'jquery', 'underscore', 'backbone', 'view/basem-view', 'hbs!template/login', 'cookie', 'localstorage'],
	function(App, $, _, Backbone, BaseView, LogInTmpl, Cookie, Localstorage) {
		return BaseView.extend({
			template: LogInTmpl,
			events: {
				'submit #login_login-main': 'login'
			},
			ui: {
				'loginThrobber': '.loginThrobber',
				'status': '.status',
				'loginError': '.loginError'
			},
			initialize: function(data) {
				_.bindAll(this);
				App.on("logout", this.logout, this);
			},
			onRender: function() {
				if (this.checkIfLoggedIn() === true) {
					this.$el.hide()
				} else {
					this.$el.show()
				}
			},

			login: function(e) {
				var self = this
				if (e) {
					e.preventDefault()
					e.stopPropagation()
				}

				this.ui.loginThrobber.css('display', 'inline-block')
				this.ui.status.html(' ') //clear the status
				this.ui.status.hide()

				var user = this.$(".loginUsername").val()
				var pw = this.$(".loginPassword").val()
				console.log(user, pw)

				var params = {
					api_type: "json",
					rem: "true",
					user: user,
					passwd: pw,
					byPassAuth: true //this will pass through the user logged in check
				};

				//http://www.reddit.com/api/login/?user=faketestuser&passwd=abc123&api_type=json
				//https://ssl.reddit.com/api/login/?user=faketestuser&passwd=abc123&api_type=json
				//url: "http://www.reddit.com/api/login",

				this.api("api/login", 'POST', params, function(data) {
					console.log(data)
					self.ui.loginThrobber.css('display', 'none')
					if (typeof data.json.errors !== 'undefined' && data.json.errors.length > 0) {
						//alert("unable to login")
						console.log(data.json.errors)
						self.ui.loginError.show().html(data.json.errors[0][1])

					} else {

						var loginData = data.json.data;
						console.log(loginData)
						window.me = loginData
						self.setLoginCookies(loginData.cookie, loginData.modhash, user)

						App.trigger("login");
						//self.$el.hide()
						$('#theLogin').hide()

					}
				});

			},
			setLoginCookies: function(tehCookie, modhash, user) {
				// set cookie
				$.cookie('reddit_session', tehCookie, {
					path: '/'
				});
				$.cookie('modhash', modhash, {
					path: '/'
				});
				$.cookie('username', user, {
					path: '/'
				});

			},

			logout: function() {
				//e.preventDefault()
				//e.stopPropagation()
				console.log("fired a logout event", this)
				$.removeCookie('reddit_session', {
					path: '/'
				});
				$.removeCookie('modhash', {
					path: '/'
				});
				$.removeCookie('username', {
					path: '/'
				});

				$.removeCookie('gold', {
					path: '/'
				});
				//localStorage.removeItem('subreddits');
				//localStorage.removeItem('userinfo');
				$.totalStorage.deleteItem('userinfo')
				$.totalStorage.deleteItem('subreddits')
				this.$el.show() //shows the login box
			}

		});

	});