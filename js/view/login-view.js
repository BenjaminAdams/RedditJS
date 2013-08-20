define(['jquery', 'underscore', 'backbone', 'resthub', 'view/base-view', 'hbs!template/login', 'event/channel', 'cookie'],
	function($, _, Backbone, Resthub, BaseView, LogInTmpl, channel, Cookie) {
		var LoginView = BaseView.extend({
			events: {
				'click .theLoginBtn': 'login',
				//'click .logout': 'logout',
			},
			initialize: function(data) {
				_.bindAll(this);
				this.template = LogInTmpl;
				this.render()
				console.log('rendering login view')
				if (this.checkIfLoggedIn() == true) {
					this.$el.hide()
				} else {
					//this.template = LoggedOutTmpl;
					this.$el.show()
				}

				channel.bind("logout", this.logout, this);
				//this.model = new SidebarModel(data.subName)

				// this.$() is a shortcut for this.$el.find().

			},
			login: function(e) {
				e.preventDefault()
				e.stopPropagation()
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
					if (data.json.errors.length > 0) {
						alert("unable to login")

					} else {

						var loginData = data.json.data;
						console.log(loginData)

						// set cookie
						$.cookie('reddit_session', loginData.cookie);
						$.cookie('modhash', loginData.modhash);
						$.cookie('username', user);
						//self.setCookie('reddit_session', loginData.cookie, 1);
						//self.template = LoggedInTmpl;
						//self.render()
						channel.trigger("login");
						self.$el.hide()
						//HeaderView.userbar.showLoggedIn()
					}
				});

			},
			logout: function() {
				//e.preventDefault()
				//e.stopPropagation()
				console.log("fired a logout event", this)
				$.removeCookie('reddit_session');
				$.removeCookie('modhash');
				$.removeCookie('username');

				this.$el.show() //might not need show()
				//HeaderView.userbar.showLoggedOut()
			}

		});
		return LoginView;
	});