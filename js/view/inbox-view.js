/* Inbox-view.js Collection

View mail in these formats:
unread
sent
all


*/
define(['underscore', 'backbone', 'resthub', 'hbs!template/inbox', 'view/inbox-item-view', 'view/base-view', 'collection/inbox'],
	function(_, Backbone, Resthub, InboxTmpl, InboxItemView, BaseView, InboxCollection) {
		var InboxView = BaseView.extend({
			//strategy: 'append',
			el: $(".content"),
			template: InboxTmpl,
			events: {
				'submit #compose-message': "sendMsg",
				'click #retry': 'tryAgain',

			},

			initialize: function(options) {
				_.bindAll(this);
				this.$el.empty()
				this.type = options.type
				this.render();
				this.selectActive()

				this.collection = new InboxCollection({
					type: this.type
				})
				this.fetchMore()

			},
			selectActive: function() {
				this.$('.selected').removeClass('selected')
				this.$('#' + this.type).addClass('selected')
			},
			fetchError: function() {
				this.$('#siteTable').html("<div id='retry' >  <img src='img/sad-icon.png' /><br /> click here to try again </div> ")
			},
			tryAgain: function() {
				this.$('#siteTable').html("<div class='loading'></div> ")
				this.$('#retry').remove()

				this.fetchMore();
			},
			fetchMore: function() {
				this.collection.fetch({
					success: this.gotNewPosts,
					error: this.fetchError
				});
			},
			gotNewPosts: function(collection) {
				var self = this
				if (collection.length < 1) {
					//this.$('#siteTable').html("there doesn't seem to be anything here")
				}
				collection.each(function(model) {
					// this.$('#siteTable').append(InboxItemTmpl({
					// 	model: model.attributes
					// }))
					var itemView = new InboxItemView({
						root: "#siteTable",
						model: model
					});
				})
			},

		});
		return InboxView;
	});