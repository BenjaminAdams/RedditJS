define([
  'underscore', 'backbone', 'resthub', 'hbs!template/single', 'view/post-row-view', 'view/sidebar-view', 'view/comments-view', 'model/single', 'event/channel', 'cookie'],
	function(_, Backbone, Resthub, singleTmpl, PostRowView, SidebarView, CommentsView, SingleModel, channel, Cookie) {
		var SingleView = Resthub.View.extend({

			el: $("#main"),
			template: singleTmpl,

			events: {
				//'click .tabmenu-right li': 'changeGridOption'
			},

			initialize: function(options) {
				_.bindAll(this);

				$(this.el).html('')

				var self = this;
				this.subName = options.subName
				this.id = options.id

				this.model = new SingleModel({
					subName: this.subName,
					id: this.id
				});

				this.template = singleTmpl;

				//this.render();
				this.model.fetch({
					success: this.loaded,
					error: this.fetchError
				});

			},

			/**************Fetching functions ****************/
			fetchError: function(response, error) {
				console.log("fetch error, lets retry")

			},
			fetchMore: function() {

			},

			loaded: function(model, res) {
				this.$('.loading').hide()

				this.render();

				//load sidebar
				this.sidebar = new SidebarView({
					subName: this.subName,
					root: ".side"
				})

				this.comments = new CommentsView({
					collection: this.collection,
					el: "#commentarea"
					//root: "#commentarea"
				})

			},

		});
		return SingleView;
	});