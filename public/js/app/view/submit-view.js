/* Submit-view.js View

Submit a link or text post to any subreddit

*/
define(['underscore', 'backbone', 'resthub', 'hbs!template/submit', 'view/base-view', 'event/channel'],
	function(_, Backbone, Resthub, SubmitTmpl, BaseView, channel) {
		var SubmitView = BaseView.extend({
			//strategy: 'append',
			el: $(".content"),
			template: SubmitTmpl,
			events: {
				'submit #newlink': "submitForm",

				'click .link-button': 'changeToLink',
				'click .text-button': 'changeToText',
				'click #suggested-reddits a': 'changeSubreddit',
				'click #mdHelpShow': 'showMdHelp',
				'click #mdHelpHide': 'hideMdHelp',
				'click #suggestTitle': 'suggestTitle'

			},

			initialize: function(options) {
				_.bindAll(this);
				this.$el.empty()
				this.subName = options.subName
				this.model = new Backbone.Model({
					subName: this.subName
				})
				this.type = 'link'

				this.render(this.subName);
				channel.on("submit:type", this.changeType, this);
				channel.on("submit:subreddits", this.loadSubreddits, this);
				this.loadSubreddits()
			},
			/*
			type can be
			*any
			*link
			*self
			*/
			changeType: function(type) {
				console.log('type from channel=', type)
				if (type == 'link') {
					this.changeToLink()
					this.$('.tabmenu').hide()
				} else if (type == "self") {
					this.changeToText()
					this.$('.tabmenu').hide()
				}
			},
			changeToLink: function(e) {
				if (e) {
					e.preventDefault()
					e.stopPropagation()
				}
				this.$('.link-button').parent().addClass('selected')
				this.$('.text-button').parent().removeClass('selected')
				this.$('#text-field').hide()
				this.$('#url-field').show()
				this.type = 'link'
			},
			changeToText: function(e) {
				if (e) {
					e.preventDefault()
					e.stopPropagation()
				}
				this.$('.text-button').parent().addClass('selected')
				this.$('.link-button').parent().removeClass('selected')
				this.$('#text-field').show()
				this.$('#url-field').hide()
				this.type = 'self'
			},
			changeSubreddit: function(e) {
				e.preventDefault()
				e.stopPropagation()
				var target = $(e.currentTarget)
				this.subName = target.text().trim()
				this.$('#sr-autocomplete').val(this.subName)
			},

			loadSubreddits: function() {
				var self = this
				$('.drop-choices .choice').each(function(index) {
					var sr = $(this).text()
					if (sr != 'edit subscriptions') {
						var str = '<li>\n<a href="#" tabindex="100">' + sr + '</a>\n</li>'
						self.$('#suggested-reddits ul').append(str)
					}
				});
			},
			showMdHelp: function(e) {
				e.preventDefault()
				e.stopPropagation()

				var mdHelp = '<p></p><p>reddit uses a slightly-customized version of <a href="http://daringfireball.net/projects/markdown/syntax">Markdown</a> for formatting. See below for some basics, or check <a href="/wiki/commenting">the commenting wiki page</a> for more detailed help and solutions to common issues.</p><p></p><table class="md"><tbody><tr style="background-color: #ffff99;text-align: center"><td><em>you type:</em></td><td><em>you see:</em></td></tr><tr><td>*italics*</td><td><em>italics</em></td></tr><tr><td>**bold**</td><td><b>bold</b></td></tr><tr><td>[reddit!](http://reddit.com)</td><td><a href="http://reddit.com">reddit!</a></td></tr><tr><td>* item 1<br>* item 2<br>* item 3</td><td><ul><li>item 1</li><li>item 2</li><li>item 3</li></ul></td></tr><tr><td>>quoted text</td><td><blockquote>quoted text</blockquote></td></tr><tr><td>Lines starting with four spaces<br>are treated like code:<br><br><span class="spaces">    </span>if 1 * 2 <3:<br><span class="spaces">        </span>print "hello, world!"<br></td><td>Lines starting with four spaces<br>are treated like code:<br><pre>if 1 * 2 <3:<br>    print "hello, world!"</pre></td></tr><tr><td>~~strikethrough~~</td><td><strike>strikethrough</strike></td></tr><tr><td>super^script</td><td>super<sup>script</sup></td></tr></tbody></table></div></div></form>'
				this.$('#mdHelp').html(mdHelp).show()
				this.$('#mdHelpShow').hide()
				this.$('#mdHelpHide').show()
			},
			hideMdHelp: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('#mdHelpShow').show()
				this.$('#mdHelpHide').hide()
				this.$('#mdHelp').html('')
			},
			suggestTitle: function(e) {
				e.preventDefault()
				e.stopPropagation()
				var self = this

				var url = '/api/getTitle?url=' + this.$('#url').val()
				$.ajax({
					url: url,
					success: function(responseHtml) {
						//console.log('responseHtml=', responseHtml)
						//var newTitle = $(responseHtml).filter('title').text().trim();
						self.$('#title').val(responseHtml)
					},
					error: function() {
						//var newTitle = $(responseHtml).filter('title').text();
						console.log('error getting title suggestion')
					}
				});
			},
			submitForm: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('.status').html('') //clear status
				var self = this

				var text = this.$('#submitTxt').val()
				var url = this.$('#url').val()
				var title = this.$('#title').val()
				var sr = this.$('#sr-autocomplete').val()

				if (typeof title === "undefined" || title.length < 3) {
					this.$('.status').html('please enter a title')
					return
				}

				if (typeof sr === "undefined" || sr.length < 1) {
					this.$('.status').html('please enter a subreddit')
					return
				}

				if (this.type == 'link' && (typeof url === "undefined" || url.length < 5)) {
					this.$('.status').html('please enter a URL')
					return
				}

				var params;
				if (this.type == 'link') {
					//params for link posts
					params = {
						api_type: 'json',
						kind: this.type,
						save: 'false',
						sendreplies: 'false',
						sr: sr,
						url: url,
						//resubmit: resubmit,
						title: title,
						uh: $.cookie('modhash')
					};
				} else {
					//params for self post
					params = {
						api_type: 'json',
						kind: this.type,
						save: 'false',
						sendreplies: 'false',
						text: text,
						sr: sr,
						//resubmit: resubmit,
						title: title,
						uh: $.cookie('modhash')
					};
				}

				console.log(params)

				this.api("api/submit", 'POST', params, function(data) {
					console.log("submit done", data)
					//detect if the link we submitted was good and went through
					if (typeof data !== 'undefined' && typeof data.json !== 'undefined') {

						if (data.json.errors.length > 0) {
							//error checking
							if (typeof data.json.errors[0] === 'undefined') {
								self.$('.status').html('Unable to submit')
							} else {
								var errorMsg = data.json.errors[0][1]
								self.$('.status').html(errorMsg)
							}

						} else if (typeof data.json.data === 'undefined') {
							self.$('.status').html('Unable to submit')

						} else if (typeof data.json.data.url !== 'undefined') { //means we have a good link!
							//post was good
							var newUrl = data.json.data.url.replace('http://www.reddit.com', '')
							newUrl = newUrl.replace('http://reddit.com', '') //for good measure in case reddit.com does not have a www
							Backbone.history.navigate(newUrl, {
								trigger: true
							})
						}
					}
				});
			}

		});
		return SubmitView;
	});