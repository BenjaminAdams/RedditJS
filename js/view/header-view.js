define(['jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/header', 'view/userbar-view', 'view/base-view', 'model/sidebar', 'collection/my-subreddits', 'event/channel', 'cookie'],
	function($, _, Backbone, Resthub, HeaderTmpl, UserbarView, BaseView, SidebarModel, MySubredditsCollection, channel, Cookie) {

		var HeaderView = BaseView.extend({
			el: $("#theHeader"),
			events: {
				//  'keyup #new-todo':     'showTooltip'
			},

			initialize: function(data) {
				_.bindAll(this);
				this.template = HeaderTmpl;
				this.mySubreddits = new MySubredditsCollection()
				//this.model = new SidebarModel()
				console.log("I should only render the header once")
				this.render();
				this.userbar = new UserbarView({
					root: "#header-bottom-right"
				})

				channel.bind("header:update", this.updateHeader, this);
				channel.bind("login", this.updateSubreddits, this); //so we update the users subreddits after they login

				//load the subreddits on the top bar
				//we want to always display the default subreddits at first because they take a long time to get back from the api
				this.mySubreddits.loadDefaultSubreddits()
				this.displayMySubreddits()

				if (this.checkIfLoggedIn() == true) {
					console.log('starting to update the subreddits in the header init')
					this.updateSubreddits()
				}

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
				this.mySubreddits.reset()
				//query the api for /me.json
				this.mySubreddits.fetch({
					success: this.displayMySubreddits
				});
			},
			displayMySubreddits: function(response, subreddits) {

				this.$('#sr-bar').html(" ") //clear the div
				//    Normal Format: 
				//			<li><a href="/r/pics/">pics</a></li>
				//   Every Subreddit after the first one has a seperator:  
				//			<li><span class="separator">-</span><a href= "/r/funny/">funny</a></li>

				var seperator = '';
				var count = 0;
				this.mySubreddits.each(function(model) {
					if (count != 0) {
						seperator = '<span class="separator">-</span>';
					}

					this.$('#sr-bar').append('<li>' + seperator + '<a href="/r/' + model.get('display_name') + '/">' + model.get('display_name') + '</a></li>')
					count++;
				})
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