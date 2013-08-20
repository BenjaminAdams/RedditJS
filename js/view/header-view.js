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
				//this.model = new SidebarModel()
				console.log("I should only render the header once")
				this.render();
				this.userbar = new UserbarView({
					root: "#header-bottom-right"
				})

				channel.bind("header:update", this.updateHeader, this);
				channel.bind("login", this.updateSubreddits, this);

				// this.$() is a shortcut for this.$el.find().

			},
			updateHeader: function(model) {
				this.model = model
				//this.userbar.render()
				this.$("#pagename-a").prop("href", model.get('rname'))
				this.$("#pagename-a").text(model.get('display_name'))

				this.$("#header-img").attr("src", model.get('header_img'));

				this.$(".hot").prop("href", model.get('rname'))
				this.$(".new").prop("href", model.get('rname') + "/new")
				this.$(".rising").prop("href", model.get('rname') + "/rising")
				this.$(".controversial").prop("href", model.get('rname') + "/controversial")
				this.$(".top").prop("href", model.get('rname') + "/top")

			},
			updateSubreddits: function() {
				//query the api for /me.json
				this.me.fetch({
					success: this.meLoaded
				});
			},
			meLoaded: function(response, model) {
				console.log('the ME model has been loaded in the header view=', model)
			},
			//so we can rerender the header without destroying the child views
			reRender: function() {

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