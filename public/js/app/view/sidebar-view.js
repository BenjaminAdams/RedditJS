define(['App', 'jquery', 'underscore', 'backbone', 'hbs!template/sidebar', 'view/basem-view', 'view/login-view', 'model/sidebar', 'cookie'],
	function(App, $, _, Backbone, SidebarTmpl, BaseView, LoginView, SidebarModel, Cookie) {
		var SidebarView = BaseView.extend({
			events: {
				'submit #search': 'gotoSearch',
				'click .add': 'subscribe',
				'click .remove': 'unsubscribe'
			},

			regions: {
				'theLogin': '#theLogin'
			},

			initialize: function(data) {
				_.bindAll(this);
				this.template = SidebarTmpl;
				this.subName = data.subName
				this.dynamicStylesheet(this.subName)
				this.model = data.model
				if (this.subName == "front") {
					this.model.set('isFront', true)
				}
			},
			onRender: function() {
				console.log('sidebar rendered')
				this.loadLoginView()
				if (this.subName == "front") {
					//this.model.set('header_img', 'img/logo.png')
					this.model.set('isFront', true)
					this.$('.titlebox').hide()
				}
				this.loadLoginView()
				App.trigger("header:update", this.model);
				App.trigger('submit:type', this.model.get('submission_type'))
				if (App.settings.get('showSidebar') === false) {
					$('.side').hide()
				}
				this.addOutboundLink()

			},
			addOutboundLink: function() {
				this.$('.usertext-body a').addClass('outBoundLink').attr("data-bypass", "true"); //makes the link external to be clickable
				this.$('.usertext-body a').attr('target', '_blank');
			},
			subscribe: function(e) {
				e.preventDefault()
				e.stopPropagation()
				var target = this.$(e.currentTarget)
				target.removeClass('add').addClass('remove').html('unsubscribe')

				var params = {
					action: 'sub',
					sr: this.model.get('name'),
					sr_name: this.model.get('name'),
					uh: $.cookie('modhash')
				};

				this.api("api/subscribe", 'POST', params, function(data) {
					console.log("vote done", data)
					App.trigger('header:refreshSubreddits')
				});

			},
			unsubscribe: function(e) {
				e.preventDefault()
				e.stopPropagation()
				var target = this.$(e.currentTarget)
				target.removeClass('remove').addClass('add').html('subscribe')
				var params = {
					action: 'unsub',
					sr: this.model.get('name'),
					uh: $.cookie('modhash')
				};
				this.api("api/subscribe", 'POST', params, function(data) {
					console.log("vote done", data)
					App.trigger('header:refreshSubreddits')
				});
			},

			gotoSearch: function(e) {
				e.preventDefault()
				e.stopPropagation()
				var q = encodeURIComponent(this.$('.sidebarSearch').val())
				console.log('user searched for ', q)
				Backbone.history.navigate('/search/' + q, {
					trigger: true
				})

			},
			loadLoginView: function() {
				this.theLogin.show(new LoginView())

				//now render the login view
				//this.loginView.render();
			}

		});
		return SidebarView;
	});