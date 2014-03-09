define(['App', 'jquery', 'underscore', 'backbone', 'hbs!template/mobile-header', 'view/userbar-view', 'view/header-sr-display', 'view/basem-view', 'model/sidebar', 'cookie'],
	function(App, $, _, Backbone, HeaderTmpl, UserbarView, SRDisplay, BaseView, SidebarModel, Cookie) {
		return BaseView.extend({
			template: HeaderTmpl,
			events: {
				'click #mViewPickerBox li': 'changeGridOption',
				'click .drop-down-header-toggle': 'toggleDropdown',
				//'click #sr-display': 'toggleDropdown', //will close the menu after the user makes a selection
				'click #userbar-logged-out': 'showLoginPopup',
				//'click .mdropdown': 'toggleDropDown',
				'click #mSortPickerBox': 'toggleDropDown'

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
				'hotornew': '#hotornew',
				'mobileChangeView': '#mobileChangeView',
				'mSortPickerBox': '#mSortPickerBox',
				'mViewPickerBox': '#mViewPickerBox'
			},
			regions: {
				'popupWindow': '#popupWindow',
				'srDisplay': '#sr-display',
				'mobileUserBar': '#mobileUserBar'
			},
			initialize: function(data) {
				_.bindAll(this);
				App.on("header:update", this.updateHeader, this);
				App.on("login", this.updateSubreddits, this); //so we update the users subreddits after they login
				App.on("header:updateSortOrder", this.updateSortOrder, this);
				App.on("header:refreshSubreddits", this.refreshSubreddits, this);
				App.on('header:showLoginBox', this.showLoginPopup, this)
				//load the subreddits on the top bar
				//we want to always display the default subreddits at first because they take a long time to get back from the api
				this.listenTo(App.subreddits.mine, 'sync', this.displayMySubreddits)

			},
			onRender: function() {
				var self = this
				this.changeActiveGrid($.cookie('gridOption')) //so we are highlighting the correct grid option on page load

				this.mobileUserBar.show(new UserbarView({
					mobile: true
				}))
				this.srDisplay.show(new SRDisplay())
				this.displayMySubreddits()

				this.checkHashOpt()

				this.ui.hotornew.hover(function() {
					self.ui.mSortPickerBox.show();
				}, function() {
					self.ui.mSortPickerBox.hide()
				});

				this.ui.mobileChangeView.hover(function() {
					self.ui.mViewPickerBox.show();
				}, function() {
					self.ui.mViewPickerBox.hide()
				});

			},
			toggleDropDown: function(e) {
				console.log('closing driopdown')
				var target = this.$(e.currentTarget)
				target.toggle()
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

			closeMobileOptions: function() {
				if ($(document).width() < App.mobileWidth) {
					//only close the mobile options menu if we are in mobile mode
					this.ui.tabmenu.slideUp()
				}

			},

			showLoginPopup: function(e) {
				var self = this
				if (e) {
					e.preventDefault()
					e.stopPropagation();
				}
				require(['view/login-popup-view'], function(LoginPopupView) {
					self.popupWindow.show(new LoginPopupView())
				});
			},

			updateHeader: function(model) {
				this.model = model
				//this.userbar.render()
				this.ui.pagenameA.prop("href", model.get('rname'))
				this.ui.pagenameA.text(model.get('display_name'))

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
				this.changeActiveGrid(id) //so we are highlighting the correct grid option on page load
				$.cookie('gridOption', id, {
					path: '/'
				});

				//hide parent aka the dropdown box
				var parent = this.$(e.currentTarget).parent().hide()

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
				App.subreddits.mine.each(function(model) {

					if (count !== 0) {
						seperator = '<span class="separator">-</span>';
					}

					if (model.get('display_name') != "announcements" && model.get('display_name') != "blog") {

						self.ui.srBar.append('<li>' + seperator + '<a href="/r/' + model.get('display_name') + '/">' + model.get('display_name') + '</a></li>')

						count++;
					}
				})

				//this.displayDropChoices()
				App.trigger("submit:subreddits");
			}

		});
	});