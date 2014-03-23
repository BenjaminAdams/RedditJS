define(['App', 'jquery', 'underscore', 'backbone', 'view/basem-view', 'hbs!template/blank', 'cookie'],
	function(App, $, _, Backbone, BaseView, Tmpl, Cookie) {
		return BaseView.extend({
			template: Tmpl,

			initialize: function(data) {
				_.bindAll(this);
			},
			onRender: function() {
				//this.getMe()
				window.close()
			},

			// getMe: function(e) {
			// 	var self = this

			// 	var params = {
			// 		byPassAuth: true //this will pass through the user logged in check
			// 	};

			// 	this.api("api/v1/me", 'GET', params, function(data) {

			// 		if (!data || data.status >= 300) {
			// 			//alert("unable to login")

			// 			//self.ui.loginError.show().html(data.json.errors[0][1] + ".. The Reddit API may be rate limiting this.")
			// 			alert('error getting user data')

			// 		} else {

			// 			App.me = data
			// 			self.setLoginCookies(data)

			// 			App.trigger("login");

			// 		}

			// 		var redirect = $.cookie('redirect') || '/'
			// 		//window.location = redirect
			// 		Backbone.history.navigate(redirect, {
			// 			trigger: true
			// 		})

			// 	});

			// },
			// setLoginCookies: function(data) {

			// 	$.cookie('username', data.name, {
			// 		path: '/'
			// 	});

			// }

		});

	});