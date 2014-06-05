/* Compose-view.js

Sends an outgoing to message to another reddit user

*/
define(['App', 'underscore', 'backbone', 'hbs!template/compose', 'view/basem-view'],
	function(App, _, Backbone, ComposeTmpl, BaseView) {
		return BaseView.extend({
			template: ComposeTmpl,
			events: {
				'submit #compose-message': "sendMsg"
			},
			ui: {
				'msgTxt': '#msgTxt',
				'to': '#to',
				'subject': '#subject',
				'status': '.status',
				'error': '.error'
			},
			initialize: function(options) {
				_.bindAll(this);

				//if the user clicks reply we populate the subject and author to help out the user
				if (typeof App.mailReplyTarget !== 'undefined') {
					this.model = App.mailReplyTarget
					delete App.mailReplyTarget;

					//this.model.set('dest', options.username)

				} else {
					this.model = new Backbone.Model({
						dest: options.username
					})
				}

			},
			sendMsg: function(e) {
				e.preventDefault()
				e.stopPropagation();
				var self = this;

				var params = {
					to: this.ui.to.val(),
					text: this.ui.msgTxt.val(),
					subject: this.ui.subject.val(),
					uh: $.cookie('modhash')
				};

				this.api("/api/compose", 'POST', params, function(data) {
					console.log("msg  done", data)
					if (data.jquery.length > 18) {
						self.ui.status.html("Message sent")
						self.ui.msgTxt.val('')
						self.ui.to.val('')
						self.ui.subject.val('')
					} else {
						self.ui.error.html('failed to send message')
					}

				});
			}

		});
	});