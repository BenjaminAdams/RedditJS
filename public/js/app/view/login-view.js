define(['jquery', 'underscore', 'backbone', 'resthub', 'view/base-view', 'hbs!template/login', 'event/channel', 'cookie', 'localstorage'],
	function($, _, Backbone, Resthub, BaseView, LogInTmpl, channel, Cookie, Localstorage) {
		var LoginView = BaseView.extend({
			events: {
				'submit #login_login-main': 'login'
			},
			initialize: function(data) {
				_.bindAll(this);
				this.template = LogInTmpl;
				this.render()
				if (this.checkIfLoggedIn() === true) {
					this.$el.hide()
				} else {
					this.$el.show()
				}

				channel.on("logout", this.logout, this);

			},
			login: function(e) {
				if (e) {
					e.preventDefault()
					e.stopPropagation()
				}
				this.$('.loginThrobber').css('display', 'inline-block')
				this.$('.status').html(' ') //clear the status
				this.$('.status').hide()

				var self = this;
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

					if (typeof data.json.errors !== 'undefined' && data.json.errors.length > 0) {
						//alert("unable to login")
						console.log(data.json.errors)
						this.$('.loginError').show()
						this.$('.loginError').html(data.json.errors[0][1])
						this.$('.loginThrobber').css('display', 'none')

					} else {
						this.$('.loginThrobber').css('display', 'none')
						var loginData = data.json.data;
						console.log(loginData)
						window.me = loginData
						self.setLoginCookies(loginData.cookie, loginData.modhash, user)

						channel.trigger("login");
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
				localStorage.removeItem('subreddits');
				localStorage.removeItem('userinfo');

				this.$el.show() //shows the login box
			}

		});
		return LoginView;
	});