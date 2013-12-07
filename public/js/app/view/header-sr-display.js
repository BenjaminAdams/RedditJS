define(['App', 'jquery', 'underscore', 'backbone', 'hbs!template/srDisplay', 'view/basem-view', 'collection/sr-list', 'cookie'],
	function(App, $, _, Backbone, SRDisplayTmpl, BaseView, SRListCollection, Cookie) {
		return BaseView.extend({
			template: SRDisplayTmpl,
			id: "header-nav-logo-area",
			events: {
				'click a': 'toggleDropdown',
				'click #categoryList li': "changeSelectedCat",
				'click .srDisplayType': 'changeDisplayType'
			},
			ui: {
				'innerSR': '#innerSR',
				'categoryList': '#categoryList'
			},
			initialize: function(data) {
				_.bindAll(this);
				App.on('header-sr-display:toggle', this.toggleDropdown)
				this.srListCollection = new SRListCollection()
				this.fetchedSRList = false
				this.selectedCategory = 'mine'
				this.displayType = 0

			},
			onRender: function() {

			},
			toggleDropdown: function() {
				var self = this

				if (this.fetchedSRList === false) { //waiting to do this until the user actually interacts with it
					this.fetchedSRList = true
					this.srListCollection.fetch({
						success: this.renderCategories
					})
				}
				if (this.$el.is(':visible')) {
					this.$el.slideUp("slow")
				} else {
					this.ui.innerSR.empty()
					//this.renderMySubreddits()
					this.displayCategory(this.selectedCategory)
					this.$el.slideDown("slow")
				}
			},
			changeSelectedCat: function(e) {
				this.ui.innerSR.empty()
				$(window).scrollTop(0)
				var target = $(e.currentTarget)
				var name = target.data('id')
				this.selectedCategory = name
				this.displayCategory(name)
			},
			displayCategory: function(name) {

				if (name == 'mine') {
					this.renderMySubreddits()
				} else {
					this.renderRegularSubreddit(window.subreddits[name])
				}
			},
			changeDisplayType: function(e) {
				var target = $(e.currentTarget)
				console.log(target.val())
				this.displayType = target.val()
				this.ui.innerSR.empty()
				this.displayCategory(this.selectedCategory)

			},
			renderCategories: function() {
				var self = this
				_.each(window.subreddits, function(item, name) {
					self.ui.categoryList.append('<li data-id="' + name + '">' + name + '</li>')
				})
			},
			renderRegularSubreddit: function(subreddits) {
				var self = this
				//_.each(subreddits, function(model) {
				//subreddits.each(function(model) {
				for (var item in subreddits) {

					var headerImg = subreddits[item].header_img
					var displayName = subreddits[item].display_name

					if (typeof headerImg === 'undefined' || headerImg == 'null' || self.displayType == 1) {
						self.ui.innerSR.append("<span class='headerNavLogo' ><a class='text-header-nav'  href='/r/" + displayName + "' >" + displayName + "</span></a> ")
					} else {
						self.ui.innerSR.append("<span class='headerNavLogo'><a href='/r/" + displayName + "' title='" + displayName + "' ><img src='" + headerImg + "' /></a></span>")
					}

				}
			},
			renderMySubreddits: function() {
				var self = this
				window.subreddits.mine.each(function(model) {
					var headerImg = model.get('header_img')
					var displayName = model.get('display_name')
					if (headerImg === null || self.displayType == 1) {
						self.ui.innerSR.append("<span class='headerNavLogo' ><a class='text-header-nav'  href='/r/" + displayName + "' >" + displayName + "</span></a> ")
					} else {
						self.ui.innerSR.append("<span class='headerNavLogo'><a href='/r/" + displayName + "' title='" + displayName + "' ><img src='" + headerImg + "' /></a></span>")
					}
				})
			}
		});
	});