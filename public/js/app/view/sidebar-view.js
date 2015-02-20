define(['App', 'jquery', 'underscore', 'backbone', 'hbs!template/sidebar', 'view/basem-view', 'model/sidebar', 'cookie'],
	function(App, $, _, Backbone, SidebarTmpl, BaseView, SidebarModel, Cookie) {
		var SidebarView = BaseView.extend({
			events: {
				'submit #search': 'gotoSearch',
				'click .add': 'subscribe',
				'click .remove': 'unsubscribe'
			},
			ui: {
				adSlot: '#adSlot'
			},

			regions: {
				'theLogin': '#theLogin'
			},
			initialize: function(data) {
				_.bindAll(this);

				if (App.isBot === true) {
					return this.destroy()
				}

				this.template = SidebarTmpl;
				this.subName = data.subName
				this.dynamicStylesheet(this.subName)
				this.model = data.model
				if (this.subName == "front") {
					this.model.set('isFront', true)
					this.model.set('display_name_for_download', 'front')
				} else {
					this.model.set('display_name_for_download', this.model.get('display_name'))
				}

				if (this.subName === 'leagueoflegends') {
					this.model.set('isLOL', true)
				} else {
					this.model.set('isLOL', false)
				}

				App.on("resized", this.resize, this);
				App.on("subreddit:changeGridOption", this.changeGridOption, this);

			},
			onRender: function() {
				console.log('sidebar rendered')
					//this.loadLoginView()
				if (this.subName == "front") {
					//this.model.set('header_img', 'img/logo.png')
					//this.model.set('isFront', true)
					this.$('.titlebox').hide()
				}

				//this.loadLoginView()
				App.trigger("header:update", this.model);
				App.trigger('submit:type', this.model.get('submission_type'))
				if (App.settings.get('showSidebar') === false) {
					$('.side').hide()
				}
				this.addOutboundLink()

				this.showAd()

			},
			OnBeforeDestroy: function() {
				App.off("subreddit:changeGridOption", this.changeGridOption, this);
			},

			showAd: function() {
				var self = this

				//setTimeout(function() {
				//self.ui.adSlot.html('<script type="text/javascript"><!--amazon_ad_tag = "armasarcad-20"; amazon_ad_width = "300"; amazon_ad_height = "250"; amazon_ad_link_target = "new";//--></script><script type="text/javascript" src="http://ir-na.amazon-adsystem.com/s/ads.js"></script>')
				//}, 500)

				//this.ui.adSlot.html('<script type="text/javascript" src="http://ap.lijit.com/www/delivery/fp?z=143232&u=Armastevs"></script>')
				// var s = document.createElement("script");
				// s.type = "text/javascript";
				// s.src = "http://ap.lijit.com/www/delivery/fp?z=143232&u=Armastevs";
				// // Use any selector
				// this.ui.adSlot.html(s);

				//this.ui.adSlot.html('');

				// var iframe = document.createElement('iframe');
				// this.ui.adSlot.html(iframe);
				// var doc = iframe.contentWindow.document;

				// // do this whenever you want (f.ex after ajax is made):
				// doc.open();
				// doc.write('<script type="text/javascript" src="http://ap.lijit.com/www/delivery/fp?z=143232&u=Armastevs"></script>');
				// doc.destroy();

			},

			changeGridOption: function(data) {
				if (this.gridOption == data.gridOption) {
					return;
					//do nothingif the user already clicked this once
				}
				this.gridOption = data.gridOption

				if (this.gridOption === 'grid') {
					$('.side').hide()
				} else {
					if (App.settings.get('showSidebar') === true) {
						$('.side').show()
					}
				}

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
				//this.theLogin.show(new LoginView())

				//now render the login view
				//this.loginView.render();
			},
			resize: function() {

				var gridOpt = $.cookie('gridOption');

				if ($(document).width() > App.mobileWidth && App.settings.get('showSidebar') === true && gridOpt != 'grid') {
					$('.side').show()
				} else {

					$('.side').hide()
				}

			}

		});
		return SidebarView;
	});