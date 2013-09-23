/* Compose-view.js

Sends an outgoing to message to another reddit user

*/

define(['underscore', 'backbone', 'resthub', 'hbs!template/compose', 'view/base-view'],
	function(_, Backbone, Resthub, ComposeTmpl, BaseView) {
		var ComposeView = BaseView.extend({
			//strategy: 'append',
			el: $(".content"),
			template: ComposeTmpl,
			events: {
				'submit #compose-message': "sendMsg"

			},

			initialize: function(options) {
				_.bindAll(this);
				//this.template = MessageTmpl
				this.model = new Backbone.Model({
					username: options.username
				})
				this.render();

			},
			sendMsg: function(e) {
				e.preventDefault()
				e.stopPropagation();
				var self = this;
				var msgTxt = this.$('#msgTxt').val()
				var msgSendTo = this.$('#to').val()
				var msgSubject = this.$('#subject').val()

				var params = {
					to: msgSendTo,
					text: msgTxt,
					subject: msgSubject,
					uh: $.cookie('modhash')
				};
				console.log(params)

				this.api("/api/compose", 'POST', params, function(data) {
					console.log("msg  done", data)
					if (data.jquery.length > 18) {
						this.$('.status').html("Message sent")
						self.$('#msgTxt').val('')
						self.$('#to').val('')
						self.$('#subject').val('')
					} else {
						this.$('.error').html('failed to send message')
					}

				});
			}

		});
		return ComposeView;
	});