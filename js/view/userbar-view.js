define(['jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/userbar', 'view/base-view', 'event/channel'],
	function($, _, Backbone, Resthub, UserbarTmpl, BaseView, channel) {
		var UserbarView = BaseView.extend({
			events: {
				//  'keyup #new-todo':     'showTooltip'
				'click .logout': 'logout',
			},

			initialize: function(data) {
				_.bindAll(this);
				this.template = UserbarTmpl;
				//this.model = new SidebarModel(data.subName)

				this.render();

				if (this.checkIfLoggedIn() == true) {
					this.showLoggedIn()
				} else {
					this.showLoggedOut()
				}

				channel.bind("login", this.showLoggedIn, this);

				// this.$() is a shortcut for this.$el.find().

			},
			showLoggedIn: function() {
				this.$("#userbar-logged-in").show()
				this.$("#userbar-logged-out").hide()
			},
			showLoggedOut: function() {
				this.$("#userbar-logged-in").hide()
				this.$("#userbar-logged-out").show()
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