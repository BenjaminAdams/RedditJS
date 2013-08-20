define(['jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/sidebar', 'view/base-view', 'view/login-view', 'model/sidebar', 'cookie'],
	function($, _, Backbone, Resthub, SidebarTmpl, BaseView, LoginView, SidebarModel, Cookie) {
		var SidebarView = BaseView.extend({
			events: {
				'click .theLoginBtn': 'login',
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
			login: function(e) {
				e.preventDefault()
				var self = this;
				var user = this.$(".loginUsername").val()
				var pw = this.$(".loginPassword").val()
				console.log(user, pw)

				var params = {
					api_type: "json",
					rem: "true",
					user: user,
					passwd: pw
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

						console.log("setting cookie=", loginData.cookie)

						// set cookie
						$.cookie('reddit_session', loginData.cookie);
						$.cookie('modhash', loginData.modhash);
						$.cookie('username', user);
						//self.setCookie('reddit_session', loginData.cookie, 1);
					}
				});

			}

		});
		return SidebarView;
	});