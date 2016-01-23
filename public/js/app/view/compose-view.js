/* Compose-view.js

Sends an outgoing to message to another reddit user

*/
define(['App', 'underscore', 'backbone', 'hbs!template/compose', 'view/basem-view'],
	function(App, _, Backbone, ComposeTmpl, BaseView) {
		return BaseView.extend({
			template: ComposeTmpl,
			events: {
				'submit #compose-message': "sendMsg",
				'click #refreshCaptcha': 'getNewCaptcha'
			},
			ui: {
				'msgTxt': '#msgTxt',
				'to': '#to',
				'captcha': '#captcha',
				'idenContainer': '#idenContainer',
				'idenImg': '#idenImg',
				'subject': '#subject',
				'status': '.status',
				'error': '.error'
			},
			initialize: function(options) {
				_.bindAll(this);
				this.iden = ''

				//if the user clicks reply we populate the subject and author to help out the user
				if (typeof App.mailReplyTarget !== 'undefined' && App.mailReplyTarget !== null) {
					this.model = App.mailReplyTarget
					App.mailReplyTarget = null;

					//this.model.set('dest', options.username)

				} else {
					this.model = new Backbone.Model({
						dest: options.username
					})
				}

			},

			showCaptcha: function(iden) {
				this.ui.error.empty()
				this.iden = iden
				this.ui.idenContainer.show()
				this.ui.captcha.val('')
				//http://www.reddit.com/captcha/fUEgBx37ZVgACNFvqxCBVmd4rBwIpjTJ.png
				this.ui.idenImg.attr('src', 'http://www.reddit.com/captcha/' + iden + '.png')
			},

			checkIfUserNeedsCaptcha: function(cb) {
				var self = this
				var captcha = this.ui.captcha.val()
				if (captcha.length > 0) {
					return cb(true) //let the user submit if they have the captcha filled out
				}

				this.api("/api/needs_captcha.json", 'GET', {}, function(data) {
					if (data) {
						//it returns data=true if we need to display
						self.getNewCaptcha()
					} else {
						cb()
					}

				});
			},

			getNewCaptcha: function() {
				var self = this

				self.ui.error.empty()
				this.api("/api/new_captcha", 'POST', {}, function(data) {
					console.log(data)

					//for some reason we have to parse the cap iden out of the awful object, it [11] here but [10] in the function above..WOW!
					if (typeof data !== 'undefined' && typeof data.jquery !== 'undefined' && typeof data.jquery[11] !== 'undefined' && typeof data.jquery[11][3] !== 'undefined' && typeof data.jquery[11][3][0] !== 'undefined') {
						self.showCaptcha(data.jquery[11][3][0])
						return;
					} else {
						self.ui.error.html('failed to get captcha')
					}

				});
			},

			sendMsg: function(e) {
				e.preventDefault()
				e.stopPropagation();
				var self = this;

				self.ui.error.html('<img src="/img/loading.gif" />')

				//check if user needs to use a captcha

				this.checkIfUserNeedsCaptcha(function() {

					var params = {
						to: self.ui.to.val(),
						text: self.ui.msgTxt.val(),
						subject: self.ui.subject.val(),
						iden: self.iden,
						captcha: self.ui.captcha.val()

					};
					console.log(params)

					self.api("/api/compose", 'POST', params, function(data) {
						console.log("msg  done", data)

						//check if we need to show captcha
						if (typeof data !== 'undefined' && typeof data.jquery !== 'undefined' && typeof data.jquery[10] !== 'undefined' && typeof data.jquery[10][3] !== 'undefined' && typeof data.jquery[10][3][0] !== 'undefined') {
							self.showCaptcha(data.jquery[10][3][0])

						}

						if (data.jquery.length > 27) {
							//todo: this is an awful way to check for success
							self.ui.status.html("Message sent")
							self.ui.msgTxt.val('')
							self.ui.to.val('')
							self.ui.subject.val('')
							self.ui.idenContainer.hide()
						} else {

							//extract user error msg out of awful object
							if (typeof data !== 'undefined' && typeof data.jquery !== 'undefined' && typeof data.jquery[16] !== 'undefined' && typeof data.jquery[16][3] !== 'undefined' && typeof data.jquery[16][3][0] !== 'undefined') {
								self.ui.error.html(data.jquery[16][3][0])

							} else {
								//or show generic msg
								self.ui.error.html('failed to send message')
							}

						}

					});

				})

			}

		});
	});