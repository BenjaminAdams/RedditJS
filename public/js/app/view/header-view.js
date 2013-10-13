define(['jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/header', 'view/userbar-view', 'view/base-view', 'model/sidebar', 'event/channel', 'cookie'],
	function($, _, Backbone, Resthub, HeaderTmpl, UserbarView, BaseView, SidebarModel, channel, Cookie) {
		var HeaderView = BaseView.extend({
			template: HeaderTmpl,
			el: $("#theHeader"),
			events: {
				'click .tabmenu-right li': 'changeGridOption',
				'click .drop-down-header-toggle': 'toggleDropdown',
				'click #header-nav-logo-area a': 'toggleDropdown', //will close the menu after the user makes a selection
				'click #userbar-logged-out': 'showLoginPopup'
			},
			initialize: function(data) {
				_.bindAll(this);
				this.displaySRImgs = true
				console.log("I should only render the header once")
				this.render();

				channel.on("header:update", this.updateHeader, this);
				channel.on("login", this.updateSubreddits, this); //so we update the users subreddits after they login
				channel.on("header:updateSortOrder", this.updateSortOrder, this);
				channel.on("header:refreshSubreddits", this.refreshSubreddits, this);

				//load the subreddits on the top bar
				//we want to always display the default subreddits at first because they take a long time to get back from the api

				this.displayMySubreddits()

				this.listenTo(window.subreddits, 'sync', this.displayMySubreddits)

				this.changeActiveGrid($.cookie('gridOption'))
				//this.changeActiveGrid($.cookie('gridOption')) //so we are highlighting the correct grid option on page load

				//this function now handled by the init of the model itself
				//if (this.checkIfLoggedIn() === true) {
				//this.updateSubreddits()
				//}

				// setTimeout(function() {
				//this.userbar = new UserbarView({
				//root: "#header-bottom-right"
				//})
				//}, 1000)
				try {
					this.userbar = new UserbarView({
						root: "#header-bottom-right"
					})
				} catch (e) {
					console.log('FAILED TO LOAD USR BAR')
				}

				// this.$() is a shortcut for this.$el.find().

			},

			showLoginPopup: function() {
				require(['view/login-popup-view'], function(LoginPopupView) {
					var loginPopupView = new LoginPopupView({
						el: "#popupWindow"
					})
				});
			},
			toggleDropdown: function() {
				//this.$('.drop-down-header').toggle()
				var target = this.$("#header-nav-logo-area")
				if (target.is(':visible')) {
					target.slideUp("slow")
				} else {
					target.slideDown("slow")
				}

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
			updateSortOrder: function(data) {
				//console.log(data)
				var sortOrder = data.sortOrder
				var domain = data.domain
				var subName = data.subName
				this.$('.hot').parent().removeClass('selected');
				this.$('.new').parent().removeClass('selected');
				this.$('.rising').parent().removeClass('selected');
				this.$('.controversial').parent().removeClass('selected');
				this.$('.top').parent().removeClass('selected');
				this.$('.' + sortOrder).parent().addClass('selected');

				if (domain === null) {
					//http://localhost/r/funny/new
					this.$('.hot').attr("href", "/r/" + subName + '/');
					this.$('.new').attr("href", "/r/" + subName + '/new');
					this.$('.rising').attr("href", "/r/" + subName + '/rising');
					this.$('.controversial').attr("href", "/r/" + subName + '/controversial');
					this.$('.top').attr("href", "/r/" + subName + '/top');
				} else {
					//http://localhost/domain/i.imgur.com/new
					this.$('.hot').attr("href", "/domain/" + domain + '/');
					this.$('.new').attr("href", "/domain/" + domain + '/new');
					this.$('.rising').attr("href", "/domain/" + domain + '/rising');
					this.$('.controversial').attr("href", "/domain/" + domain + '/controversial');
					this.$('.top').attr("href", "/domain/" + domain + '/top');
				}
			},

			changeGridOption: function(e) {
				e.preventDefault()
				e.stopPropagation();
				var id = this.$(e.currentTarget).attr('id')
				channel.trigger("subreddit:changeGridOption", {
					gridOption: id
				});
				this.changeActiveGrid(id) //so we are highlighting the correct grid option on page load
				$.cookie('gridOption', id, {
					path: '/'
				});
			},
			changeActiveGrid: function(id) {
				if (typeof id === 'undefined' || id === null || id === "") {
					id = 'normal'
				}

				this.$('#normal').removeClass('selected');
				this.$('#small').removeClass('selected');
				this.$('#large').removeClass('selected');
				this.$('#grid').removeClass('selected');
				this.$('#' + id).addClass('selected');
			},
			refreshSubreddits: function() {
				$.removeCookie('subreddits', {
					path: '/'
				});
				this.updateSubreddits()
			},
			updateSubreddits: function() {
				console.log('updating subreddits!@')
				window.subreddits.reset()
				//query the api for /me.json
				window.subreddits.fetch();

			},
			displayMySubreddits: function(response, subreddits) {
				var self = this;
				this.$('#sr-bar').html(" ") //clear the div

				if (self.displaySRImgs === true) {
					//show CSS for large dropdown
					//this.$('#header-nav-logo-area').empty().show()
					this.$('#header-nav-logo-area').empty()
				} else {

				}

				//    Normal Format: 
				//			<li><a href="/r/pics/">pics</a></li>
				//   Every Subreddit after the first one has a seperator:  
				//			<li><span class="separator">-</span><a href= "/r/funny/">funny</a></li>

				//window.subreddits = this.mySubreddits
				var seperator = '';
				var count = 0;
				window.subreddits.each(function(model) {

					if (count !== 0) {
						seperator = '<span class="separator">-</span>';
					}
					if (model.get('display_name') != "announcements" && model.get('display_name') != "blog") {

						var headerImg = model.get('header_img')
						if (headerImg == null) {
							self.$('#header-nav-logo-area').append("<span class='headerNavLogo'><a class='text-header-nav' href='/r/" + model.get('display_name') + "' >" + model.get('display_name') + "</span></a> ")
						} else {
							self.$('#header-nav-logo-area').append("<span class='headerNavLogo'><a href='/r/" + model.get('display_name') + "' ><img src='" + headerImg + "' /></a></span>")
						}

						self.$('#sr-bar').append('<li>' + seperator + '<a href="/r/' + model.get('display_name') + '/">' + model.get('display_name') + '</a></li>')

						count++;
					}
				})

				this.displayDropChoices()
				channel.trigger("submit:subreddits");
			},
			displayDropChoices: function() {
				this.$('.drop-down-header').html(" ") //clear the div

				//format:  <a class="choice" href="/r/AdviceAnimals/">AdviceAnimals</a>

				//window.subreddits.each(function(model) {
				//this.$('.drop-choices').append('<li>' + seperator + '<a href="/r/' + model.get('display_name') + '/">' + model.get('display_name') + '</a></li>')
				//this.$('.drop-down-header').append('<a class="choice" href="/r/' + model.get('display_name') + '/">' + model.get('display_name') + '</a>')
				//})

				//add the edit subscriptions button
				//this.$('.drop-down-header').append('<a class="choice bottom-option" href="/subreddits/">edit subscriptions</a>')

			}

		});
		//return new HeaderView();
		//return header;
		return HeaderView;
	});