define(['jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/header', 'view/base-view', 'model/sidebar', 'cookie'],
	function($, _, Backbone, Resthub, HeaderTmpl, BaseView, SidebarModel, Cookie) {

		var HeaderView = BaseView.extend({
			el: $("#theHeader"),
			events: {
				//  'keyup #new-todo':     'showTooltip'
			},

			initialize: function(data) {
				_.bindAll(this);
				this.template = HeaderTmpl;
				//this.model = new SidebarModel(data.subName)

				this.render();
				this.headerImg = ""
				// this.model.fetch({
				// 	success: this.loaded
				// });

				// this.$() is a shortcut for this.$el.find().

			},
			updateHeader: function(model) {
				this.headerImg = model.get('header_img')
				if (this.headerImg) {
					this.$("#header-img").removeClass('default-header')
					this.$("#header-img").attr("src", this.headerImg);
				}
			},
			// loaded: function(response, sidebar) {
			// 	this.render()

			// 	this.loginView = new LoginView({
			// 		root: "#theLogin"
			// 	})
			// 	this.loginView.render()

			// 	//now render the login view

			// },

		});
		return new HeaderView();
		//return header;
		//return HeaderView;
	});