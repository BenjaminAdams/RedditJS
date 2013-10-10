define(['jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/userbar', 'view/base-view', 'model/user-about', 'event/channel', 'cookie'],
	function($, _, Backbone, Resthub, UserbarTmpl, BaseView, UserModel, channel, Cookie) {
		var UserbarView = BaseView.extend({
			events: {
				//  'keyup #new-todo':     'showTooltip'
				'click .logout': 'logout'
			},

			initialize: function(data) {
				_.bindAll(this);
				this.template = UserbarTmpl;

				this.loggedOut = '<div id="userbar-logged-out"><span class="user">want to join? <a class="login-required" href="#">login or register</a> in seconds</span></div>'

				if (this.checkIfLoggedIn() === true) {
					this.showLoggedIn()
					//this.getMyStatus()
				} else {
					this.render();
					this.showLoggedOut()
				}

				channel.on("login", this.showLoggedIn, this);

				// this.$() is a shortcut for this.$el.find().

			},
			showLoggedIn: function() {
				this.model = new UserModel($.cookie('username'));
				this.listenTo(this.model, 'sync', this.setMyStatus)
				this.render()

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
			},
			//getMyStatus: function() {
			//if (this.me instanceof Backbone.Model === false) {

			//this.me.fetch({
			//success: this.setMyStatus
			//})
			//}
			//},
			setMyStatus: function(model) {
				//this.$el.html(" ")
				//why not just re-render here
				console.log(this.model)
				this.render()
				// this.$('#userkarma').html(model.get('uglyKarma'))
				// this.$('#userCommentkarma').html(model.get('comment_karma'))
				//if (model.get('has_mail') === true) {
				//this.$('#mail').removeClass('nohavemail').addClass('havemail')
				//}
				//if (model.get('has_mail') === true) {
				//this.$('#has_mod_mail').removeClass('nohavemail').addClass('havemail')
				//}
			}

		});
		return UserbarView;
	});