/* Inbox-view.js Collection

View mail in these formats:
unread
sent
all


*/
define(['App', 'underscore', 'backbone', 'hbs!template/inbox', 'view/inbox-item-view', 'view/basem-view', 'collection/inbox'],
	function(App, _, Backbone, InboxTmpl, InboxItemView, BaseView, InboxCollection) {
		return BaseView.extend({
			template: InboxTmpl,
			events: {
				'submit #compose-message': "sendMsg",
				'click #retry': 'tryAgain'
			},
			regions: {
				'siteTable': '#siteTable'
			},
			ui: {
				'mailLoading': '#mailLoading'
			},
			initialize: function(options) {
				_.bindAll(this);
				this.type = options.type

				this.collection = new InboxCollection([], {
					type: this.type
				})
				this.fetchMore()
				this.inboxCollectionView = new Marionette.CollectionView({
					collection: this.collection,
					itemView: InboxItemView
				})

			},
			onRender: function() {
				this.siteTable.show(this.inboxCollectionView)
				this.selectActive()

				this.showLoading()
			},
			showLoading: function() {
				this.ui.mailLoading.html("<div class='loading'> </div> ");
			},
			removeLoading: function() {
				this.ui.mailLoading.empty();
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
				if (collection.length === 0) {
					this.$('#siteTable').html("<div class='error'>there doesn't seem to be anything here</div>")
				}
				this.removeLoading()

			}

		});
	});