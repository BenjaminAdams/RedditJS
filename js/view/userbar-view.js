define(['jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/userbar', 'view/base-view', 'event/channel', 'cookie'],
	function($, _, Backbone, Resthub, UserbarTmpl, BaseView, channel, Cookie) {
		var UserbarView = BaseView.extend({
			events: {
				//  'keyup #new-todo':     'showTooltip'
				'click .logout': 'logout',
			},

			initialize: function(data) {
				_.bindAll(this);
				this.template = UserbarTmpl;

				this.loggedOut = '<div id="userbar-logged-out"><span class="user">want to join? <a class="login-required" href="#">login or register</a> in seconds</span></div>'

				if (this.checkIfLoggedIn() == true) {
					this.showLoggedIn()
				} else {
					this.showLoggedOut()
				}

				channel.bind("login", this.showLoggedIn, this);

				// this.$() is a shortcut for this.$el.find().

			},
			showLoggedIn: function() {
				this.model = new Backbone.Model({
					username: $.cookie('username'),
					karma: "123"
				})
				this.$el.html(" ")
				this.render();

			},
			showLoggedOut: function() {
				//this.$el.html(this.loggedOut)

				$(this.el).html(this.loggedOut)
			},
			logout: function(e) {
				e.preventDefault()
				e.stopPropagation()
				channel.trigger("logout");
				this.showLoggedOut()
			}

		});
		return UserbarView;
	});