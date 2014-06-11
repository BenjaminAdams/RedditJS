/* Inbox-view.js Collection

View mail in these formats:
unread
sent
all

*/
define(['App', 'underscore', 'backbone', 'hbs!template/inbox-item', 'view/basem-view'],
	function(App, _, Backbone, InboxItemTmpl, BaseView) {
		return BaseView.extend({
			template: InboxItemTmpl,
			events: {
				'click .noncollapsed .expand': "hideThread",
				'click .collapsed .expand': "showThread",
				'click .togglebuttonReport': "reportShow",
				'click .yesReport': "reportYes", //user clicks yes to report 
				'click .noReport': "reportShow", //user decides not to report this link/comment
				'click .togglebuttonBlock': "blockShow",
				'click .yesBlock': "blockYes", //user clicks yes to report 
				'click .noBlock': "blockShow", //user decides not to report this link/comment
				'click .new': 'markRead',
				'click .unread-button': 'markUnread',
				'click .replyBtn': 'clickReply'
			},

			ui: {
				messageParent: '.message-parent',
				replyBtn: '.replyBtn'
			},

			initialize: function(options) {
				_.bindAll(this);
				this.model = options.model

			},
			onRender: function() {
				if (this.model.get('new') === true) {
					this.ui.messageParent.addClass('new')
				}
				this.ui.messageParent.addClass(this.model.get('evenOrOdd')) //add even or odd classes

				if (this.model.get('was_comment') === true) {
					//this.template = CommentTmpl //template specific to comment replies
					this.ui.replyBtn.attr('href', this.model.get('context'))
					this.ui.replyBtn.text('permalink')
					this.ui.replyBtn.removeClass('replyBtn')

				}

			},

			clickReply: function(e) {
				e.preventDefault()
				e.stopPropagation()

				if (App.user.name === this.model.get('dest')) {
					this.model.set('dest', this.model.get('author'))
				}

				App.mailReplyTarget = this.model

				Backbone.history.navigate('/message/compose/' + this.model.get('dest'), {
					trigger: true
				});

			},

			hideThread: function(e) {
				e.preventDefault()
				e.stopPropagation()

				this.$('.noncollapsed').hide()
				this.$('.collapsed').show()
				this.$('.child').hide()
				this.$('.midcol').hide()

			},
			showThread: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('.collapsed').hide()
				this.$('.noncollapsed').show()
				this.$('.child').show()
				this.$('.midcol').show()

			}, //so users can report spam
			reportShow: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('.reportOption').toggle()
			},
			reportYes: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('.reportOption').hide()
				var params = {
					id: this.model.get('name'),
					uh: $.cookie('modhash')
				};
				console.log(params)

				this.api("/api/report", 'POST', params, function(data) {
					console.log("report done", data)

				});
			},
			blockShow: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('.blockOption').toggle()
			},
			blockYes: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('.blockOption').hide()
				var params = {
					id: this.model.get('name'),
					uh: $.cookie('modhash')
				};
				console.log(params)

				this.api("/api/block", 'POST', params, function(data) {
					console.log("block done", data)

				});
			},
			markRead: function() {
				console.log('marking read')
				this.ui.messageParent.removeClass('new')
				var params = {
					id: this.model.get('name'),
					uh: $.cookie('modhash')
				};
				console.log(params)

				this.api("/api/read_message", 'POST', params, function(data) {
					console.log("msg read done", data)

				});
			},
			//marks the mail unread
			markUnread: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.ui.messageParent.addClass('new')
				var params = {
					id: this.model.get('name'),
					uh: $.cookie('modhash')
				};
				console.log(params)

				this.api("/api/unread_message", 'POST', params, function(data) {
					console.log("msg read done", data)

				});
			}

		});
	});