define(['jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/header', 'view/userbar-view', 'view/base-view', 'model/sidebar', 'model/me', 'event/channel', 'cookie'],
	function($, _, Backbone, Resthub, HeaderTmpl, UserbarView, BaseView, SidebarModel, MeModel, channel, Cookie) {

		var HeaderView = BaseView.extend({
			el: $("#theHeader"),
			events: {
				//  'keyup #new-todo':     'showTooltip'
			},

			initialize: function(data) {
				_.bindAll(this);
				this.template = HeaderTmpl;
				this.me = new MeModel()
				//this.model = new SidebarModel(data.subName)
				console.log("I should only render the header once")
				this.render();
				this.userbar = new UserbarView({
					root: "#header-bottom-right"
				})

				this.headerImg = ""
				channel.bind("header:update", this.updateHeader, this);
				channel.bind("login", this.updateSubreddits, this);
				// this.model.fetch({
				// 	success: this.loaded
				// });

				// this.$() is a shortcut for this.$el.find().

			},
			updateHeader: function(model) {
				this.headerImg = model.get('header_img')
				if (this.headerImg) {
					//this.$("#header-img").removeClass('default-header')
					this.$("#header-img").attr("src", this.headerImg);
				}
			},
			updateSubreddits: function() {
				//query the api for /me.json
				this.me.fetch({
					success: this.meLoaded
				});
			},
			meLoaded: function(response, model) {
				console.log('the ME model has been loaded in the header view=', model)
			}
			// loaded: function(response, sidebar) {
			// 	this.render()

			// 	this.loginView = new LoginView({
			// 		root: "#theLogin"
			// 	})
			// 	this.loginView.render()

			// 	//now render the login view

			// },

		});
		//return new HeaderView();
		//return header;
		return HeaderView;
	});