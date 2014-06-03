define(['App', 'jquery', 'underscore', 'backbone', 'hbs!template/header', 'view/userbar-view', 'view/header-sr-display', 'view/basem-view', 'model/sidebar', 'cookie'],
	function(App, $, _, Backbone, HeaderTmpl, UserbarView, SRDisplay, BaseView, SidebarModel, Cookie) {
		return BaseView.extend({
			template: HeaderTmpl,
			events: {
				'click .tabmenu-right li': 'changeGridOption',
				'click .drop-down-header-toggle': 'toggleDropdown',
				//'click #sr-display': 'toggleDropdown', //will close the menu after the user makes a selection
				'click #userbar-logged-out': 'showLoginPopup',
				'click #mobileOptions': 'showMobileOptions',
				'click .tabmenu li': 'closeMobileOptions'
			},
			ui: {
				'siteTable': '#siteTable',
				'nextprev': '.nextprev',
				'headerImg': '#header-img',
				'pagenameA': '#pagename-a',
				'hot': '.hot',
				'New': '.new',
				'rising': '.rising',
				'controversial': '.controversial',
				'top': '.top',
				'normal': '#normal',
				'small': '#small',
				'large': '#large',
				'grid': '#grid',
				'srDisplay': '#sr-display',
				'srBar': '#sr-bar',
				'tabmenu': '.tabmenu'
			},
			regions: {
				'btmRightHeader': '#header-bottom-right',
				'popupWindow': '#popupWindow',
				'srDisplay': '#sr-display'
			},
			initialize: function(data) {
				_.bindAll(this, _.functions(this));
				App.on("header:update", this.updateHeader, this);
				//App.on("login", this.updateSubreddits, this); //so we update the users subreddits after they login
				App.on("logout", this.updateSubreddits, this);
				App.on("header:updateSortOrder", this.updateSortOrder, this);
				App.on("header:refreshSubreddits", this.refreshSubreddits, this);
				App.on('header:showLoginBox', this.showLoginPopup, this)
				//load the subreddits on the top bar
				//we want to always display the default subreddits at first because they take a long time to get back from the api
				this.listenTo(App.subreddits.mine, 'sync', this.displayMySubreddits)

			},
			onRender: function() {

				this.changeActiveGrid($.cookie('gridOption')) //so we are highlighting the correct grid option on page load

				this.btmRightHeader.show(new UserbarView())
				this.srDisplay.show(new SRDisplay())
				this.displayMySubreddits()

				this.checkHashOpt()

				//check if user has no subreddits
				if (App.subreddits.mine.length < 2) {
					App.subreddits.mine.fetch();
				}

			},
			onBeforeClose: function() {
				App.off("header:update", this.updateHeader, false);
				//App.off("login", this.updateSubreddits, false); //so we update the users subreddits after they login
				App.off("logout", this.updateSubreddits, false);
				App.off("header:updateSortOrder", this.updateSortOrder, false);
				App.off("header:refreshSubreddits", this.refreshSubreddits, false);
				App.off('header:showLoginBox', this.showLoginPopup, false);
			},

			checkHashOpt: function() {
				if (window.location.hash) {
					var hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
					if (hash === "hideOpts") {
						setTimeout(function() {
							$('.tabmenu-right').hide()
						})

					}

				}
			},

			showMobileOptions: function() {
				this.ui.tabmenu.slideToggle()
			},
			closeMobileOptions: function() {
				if ($(document).width() < App.mobileWidth) {
					//only close the mobile options menu if we are in mobile mode
					this.ui.tabmenu.slideUp()
				}

			},
			//no longer using this popup, sending user directly to login reddit page
			showLoginPopup: function(e) {
				var self = this
				if (e) {
					e.preventDefault()
					e.stopPropagation();
				}
				//require(['view/login-popup-view'], function(LoginPopupView) {
				//self.popupWindow.show(new LoginPopupView())
				//});
				//require(['view/oauth'], function(OauthPopupView) {
				//self.popupWindow.show(new OauthPopupView())
				//});

			},

			updateHeader: function(model) {
				this.model = model
				//this.userbar.render()
				this.ui.pagenameA.prop("href", model.get('rname'))
				this.ui.pagenameA.text(model.get('display_name'))
				var header_img = model.get('header_img')
				if (typeof header_img === 'undefined' || header_img === null) {
					this.ui.headerImg.attr("src", '/img/logo.png');
				} else {
					this.ui.headerImg.attr("src", header_img);
				}
				this.ui.hot.prop("href", model.get('rname'))
				this.ui.New.prop("href", model.get('rname') + "/new")
				this.ui.rising.prop("href", model.get('rname') + "/rising")
				this.ui.controversial.prop("href", model.get('rname') + "/controversial")
				this.ui.top.prop("href", model.get('rname') + "/top")

			},
			updateSortOrder: function(data) {
				//console.log(data)
				var sortOrder = data.sortOrder
				var domain = data.domain
				var subName = data.subName
				this.ui.hot.parent().removeClass('selected');
				this.ui.New.parent().removeClass('selected');
				this.ui.rising.parent().removeClass('selected');
				this.ui.controversial.parent().removeClass('selected');
				this.ui.top.parent().removeClass('selected');
				this.$('.' + sortOrder).parent().addClass('selected');

				if (domain === null) {
					//http://localhost/r/funny/new
					this.ui.hot.attr("href", "/r/" + subName + '/');
					this.ui.New.attr("href", "/r/" + subName + '/new');
					this.ui.rising.attr("href", "/r/" + subName + '/rising');
					this.ui.controversial.attr("href", "/r/" + subName + '/controversial');
					this.ui.top.attr("href", "/r/" + subName + '/top');
				} else {
					//http://localhost/domain/i.imgur.com/new
					this.ui.hot.attr("href", "/domain/" + domain + '/');
					this.ui.New.attr("href", "/domain/" + domain + '/new');
					this.ui.rising.attr("href", "/domain/" + domain + '/rising');
					this.ui.controversial.attr("href", "/domain/" + domain + '/controversial');
					this.ui.top.attr("href", "/domain/" + domain + '/top');
				}
			},

			changeGridOption: function(e) {
				e.preventDefault()
				e.stopPropagation();
				var id = this.$(e.currentTarget).attr('id')
				App.trigger("subreddit:changeGridOption", {
					gridOption: id
				});
				App.settings.set('gridOption', id)
				this.changeActiveGrid(id) //so we are highlighting the correct grid option on page load
				$.cookie('gridOption', id, {
					path: '/'
				});
			},
			changeActiveGrid: function(id) {
				if (typeof id === 'undefined' || id === null || id === "") {
					id = 'normal'
				}

				this.ui.normal.removeClass('selected');
				this.ui.small.removeClass('selected');
				this.ui.large.removeClass('selected');
				this.ui.grid.removeClass('selected');
				this.$('#' + id).addClass('selected');
			},
			refreshSubreddits: function() {
				$.removeCookie('subreddits', {
					path: '/'
				});
				this.updateSubreddits()
			},
			updateSubreddits: function() {
				App.subreddits.mine.reset()
				//query the api for /me.json

				App.subreddits.mine.fetch();
			},
			toggleDropdown: function() {
				App.trigger('header-sr-display:toggle')

			},
			displayMySubreddits: function(response, subreddits) {
				var self = this;
				this.ui.srBar.html(" ") //clear the top

				//    Normal Format: 
				//			<li><a href="/r/pics/">pics</a></li>
				//   Every Subreddit after the first one has a seperator:  
				//			<li><span class="separator">-</span><a href= "/r/funny/">funny</a></li>
				//if (this.checkIfLoggedIn() === false) {
				//App.subreddits.loadDefaultSubreddits()
				//}
				//App.subreddits = this.mySubreddits
				var seperator = '';
				var count = 0;
				var subredditStr = ''
				App.subreddits.mine.each(function(model) {

					if (count !== 0) {
						seperator = '<span class="separator">-</span>';
					}

					if (model.get('display_name') != "announcements" && model.get('display_name') != "blog") {

						subredditStr += '<li>' + seperator + '<a href="/r/' + model.get('display_name') + '/">' + model.get('display_name') + '</a></li>'

						count++;
					}
				})

				self.ui.srBar.html(subredditStr)

				//this.displayDropChoices()
				App.trigger("submit:subreddits");
			}

		});
	});