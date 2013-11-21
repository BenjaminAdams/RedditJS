/* Compose-view.js

Sends an outgoing to message to another reddit user

*/
define(['underscore', 'backbone', 'hbs!template/compose', 'view/basem-view'],
	function(_, Backbone, ComposeTmpl, BaseView) {
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
				this.model = new Backbone.Model({
					username: options.username
				})
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
				console.log(params)

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