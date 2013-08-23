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

				this.$('.throbber').css('display', 'inline-block')
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

					if (data.json.errors.length > 0) {
						//alert("unable to login")
						console.log(data.json.errors)
						this.$('.status').show()
						this.$('.status').html(data.json.errors[0][1])
						this.$('.throbber').css('display', 'none')

					} else {
						this.$('.throbber').css('display', 'none')
						var loginData = data.json.data;
						console.log(loginData)

						// set cookie
						$.cookie('reddit_session', loginData.cookie, {
							path: '/'
						});
						$.cookie('modhash', loginData.modhash, {
							path: '/'
						});
						$.cookie('username', user, {
							path: '/'
						});

						channel.trigger("login");
						self.$el.hide()

					}
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

				this.$el.show() //shows the login box
			}

		});
		return LoginView;
	});