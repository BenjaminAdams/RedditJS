define([
  'underscore', 'backbone', 'resthub', 'hbs!template/comments', 'hbs!template/comment', 'hbs!template/commentMOAR', 'view/base-view', 'collection/comments', 'model/comment', 'event/channel', 'cookie'],
	function(_, Backbone, Resthub, commentsTmpl, commentTmpl, CommentMOAR, BaseView, CommentCollection, CommentModel, channel, Cookie) {
		var CommentsView = BaseView.extend({

			template: commentsTmpl,

			events: function() {
				var _events = {
					'click .noncollapsed .expand': "hideThread",
					'click .collapsed .expand': "showThread",
					'click .upArrow': "upvoteComment",
					'click .downArrow': "downvoteComment",
					'click .replyToggle': 'toggleReply', //shows the textarea to input a comment
					'click .mdHelpShow': 'showMdHelp',
					'click .mdHelpHide': 'hideMdHelp',
					'click .report': 'reportShow',
					'click .reportConfirmYes': 'reportYes',
					'click .reportConfirmNo': 'reportShow',
					'submit .commentreply': 'commentReply',
					'click .cancelComment': 'cancelComment',
					'click .MOAR': "loadMOAR"

				};

				_events['submit #comment' + this.options.model.get('name')] = "comment";

				return _events;
			},

			initialize: function(options) {
				//console.log('comments view in it')
				_.bindAll(this);
				$(this.el).html('')
				var self = this;
				this.template = commentsTmpl;
				this.commentMOAR = CommentMOAR
				this.commentONE = commentTmpl

				this.collection = options.collection
				this.render();
				this.renderComments(this.collection, '#commentarea')
				this.model = options.model
				console.log('init comments view model=', this.model)

			},
			upvoteComment: function(e) {
				e.preventDefault()
				e.stopPropagation()

				var target = this.$(e.currentTarget)
				console.log('upvoting', target)
				var id = target.parent().parent().attr('id');

				var likes = this.$(".upArrow" + id).hasClass('upmod')
				console.log(".upArrow" + id, likes)
				if (likes == false) {
					this.vote(1, "t1_" + id)

					this.$('.midcol' + id).removeClass('dislikes unvoted').addClass('likes')

					this.$('.upArrow' + id).addClass('upmod')
					this.$('.upArrow' + id).removeClass('up')
					this.$('.downArrow' + id).addClass('down')
					this.$('.downArrow' + id).removeClass('downmod')

				} else {
					this.cancelVoteComment(id)
				}
			},
			cancelVoteComment: function(id) {
				this.vote(0, "t1_" + id)

				this.$('.midcol' + id).removeClass('dislikes likes').addClass('unvoted')

				this.$('.upArrow' + id).addClass('up')
				this.$('.upArrow' + id).removeClass('upmod')
				this.$('.downArrow' + id).addClass('down')
				this.$('.downArrow' + id).removeClass('downmod')

			},
			downvoteComment: function(e) {
				e.preventDefault()
				e.stopPropagation()

				var target = this.$(e.currentTarget)
				console.log('downvoting', target)
				var id = target.parent().parent().attr('id');

				var dislikes = this.$(".downArrow" + id).hasClass('downmod')
				console.log(".downArrow" + id, dislikes)
				if (dislikes == false) {
					this.vote(-1, "t1_" + id)

					this.$('.midcol' + id).removeClass('likes unvoted').addClass('dislikes')

					this.$('.upArrow' + id).addClass('up')
					this.$('.upArrow' + id).removeClass('upmod')
					this.$('.downArrow' + id).addClass('downmod')
					this.$('.downArrow' + id).removeClass('down')

				} else {
					this.cancelVoteComment(id)
				}
			},
			hideThread: function(e) {
				e.preventDefault()
				e.stopPropagation()

				var target = this.$(e.currentTarget)
				var id = target.parent().parent().parent().parent().attr('id');

				this.$('.noncollapsed' + id).hide()
				this.$('.collapsed' + id).show()
				this.$('.child' + id).hide()
				this.$('.midcol' + id).hide()

			},
			showThread: function(e) {
				e.preventDefault()
				e.stopPropagation()

				var target = this.$(e.currentTarget)
				var id = target.parent().parent().parent().attr('id');

				this.$('.collapsed' + id).hide()
				this.$('.noncollapsed' + id).show()
				this.$('.child' + id).show()
				this.$('.midcol' + id).show()

			},

			//shows the comment reply textbox
			toggleReply: function(e) {
				e.preventDefault()
				e.stopPropagation()

				var target = this.$(e.currentTarget)
				var id = target.data('id')

				this.$('#commentreply' + id).toggle()
			},
			showMdHelp: function(e) {
				e.preventDefault()
				e.stopPropagation()
				var target = this.$(e.currentTarget)
				var id = target.parent().data('id')

				var mdHelp = '<p></p><p>reddit uses a slightly-customized version of <a href="http://daringfireball.net/projects/markdown/syntax">Markdown</a> for formatting. See below for some basics, or check <a href="/wiki/commenting">the commenting wiki page</a> for more detailed help and solutions to common issues.</p><p></p><table class="md"><tbody><tr style="background-color: #ffff99;text-align: center"><td><em>you type:</em></td><td><em>you see:</em></td></tr><tr><td>*italics*</td><td><em>italics</em></td></tr><tr><td>**bold**</td><td><b>bold</b></td></tr><tr><td>[reddit!](http://reddit.com)</td><td><a href="http://reddit.com">reddit!</a></td></tr><tr><td>* item 1<br>* item 2<br>* item 3</td><td><ul><li>item 1</li><li>item 2</li><li>item 3</li></ul></td></tr><tr><td>>quoted text</td><td><blockquote>quoted text</blockquote></td></tr><tr><td>Lines starting with four spaces<br>are treated like code:<br><br><span class="spaces">    </span>if 1 * 2 <3:<br><span class="spaces">        </span>print "hello, world!"<br></td><td>Lines starting with four spaces<br>are treated like code:<br><pre>if 1 * 2 <3:<br>    print "hello, world!"</pre></td></tr><tr><td>~~strikethrough~~</td><td><strike>strikethrough</strike></td></tr><tr><td>super^script</td><td>super<sup>script</sup></td></tr></tbody></table></div></div></form>'
				this.$('#mdHelp' + id).html(mdHelp).show()
				this.$('#mdHelpShow' + id).hide()
				this.$('#mdHelpHide' + id).show()
			},
			hideMdHelp: function(e) {
				e.preventDefault()
				e.stopPropagation()
				var target = this.$(e.currentTarget)
				var id = target.parent().data('id')
				this.$('#mdHelpShow' + id).show()
				this.$('#mdHelpHide' + id).hide()
				this.$('#mdHelp' + id).html('')
			},
			//so users can report spam
			reportShow: function(e) {
				e.preventDefault()
				e.stopPropagation()
				var target = this.$(e.currentTarget)
				var id = target.parent().parent().data('id')
				this.$('#reportConfirm' + id).toggle()
			},
			reportYes: function(e) {
				e.preventDefault()
				e.stopPropagation()
				var target = this.$(e.currentTarget)
				var id = target.parent().parent().data('id')

				this.$('#reportConfirm' + id).hide()

				var params = {
					id: "t1_" + id,
					uh: $.cookie('modhash'),
				};
				console.log(params)

				this.api("/api/report", 'POST', params, function(data) {
					console.log("report done", data)

				});
			},
			commentReply: function(e) {
				e.preventDefault()
				e.stopPropagation()
				var self = this

				var target = this.$(e.currentTarget)
				var id = target.data('id')

				var text = this.$('#text' + id).val()
				console.log("text from user input=", text)
				text = this.sterilize(text) //clean the input

				var params = {
					api_type: 'json',
					thing_id: "t1_" + id,
					text: text,
					uh: $.cookie('modhash'),
				};
				console.log(params)

				this.api("/api/comment", 'POST', params, function(data) {
					console.log("comment done", data)
					self.commentCallback(data, id)
				});
			}, //callback after trying to write a comment
			commentCallback: function(data, id) {
				console.log('callback comment=', data)
				CommentModel = require('model/comment') //in order to have nested models inside of models we need to do this
				//CommentView = require('view/comment-view') //in cases of recursion its ok!

				//post comment to have the new ID from this data 
				if (typeof data !== 'undefined' && typeof data.json !== 'undefined' && typeof data.json.data !== 'undefined' && typeof data.json.data.things !== 'undefined') {
					//status{{model.name}}
					this.$('.status' + id).html('<span class="success">success!</span>')
					//data.json.data.things[0].data.link_id = this.model.get('name')
					var attributes = data.json.data.things[0].data
					attributes.author = $.cookie('username');

					//this if statement will only fire during a comment callback
					if (typeof attributes.body_html === 'undefined' && typeof attributes.contentHTML === 'string') {
						attributes.body_html = attributes.contentHTML
					}

					attributes.name = attributes.id
					if (typeof attributes.link === 'undefined') {
						attributes.link_id = this.model.get('name')

					} else {
						attributes.link_id = attributes.link
					}

					attributes.likes = true
					attributes.subreddit = this.model.get('subreddit')
					attributes.smallid = attributes.id.replace('t1_', '')
					attributes.smallid = attributes.id.replace('t3_', '')
					attributes.permalink = '/r/' + data.subreddit + '/comments/' + attributes.link_id + "#" + data.id

					attributes.downs = 0
					attributes.ups = 1

					//clear the users text
					this.$('#text' + id).val("")
					this.$('#commentreply' + id).hide()

					var newModel = new CommentModel(attributes) //shouldn't have to input this data into the model twice
					this.hideUserInput()
					//child{{model.name}}
					// var comment = new CommentView({
					// 	model: newModel,
					// 	id: newModel.get('id'),
					// 	strategy: "prepend",
					// 	root: ".child" + this.model.get('name') //append this comment to the end of this at the child
					// })		
					this.$('.child' + id).prepend(commentTmpl({
						model: newModel.attributes
					}))

				} else {
					this.$('.status' + id).html('error ' + data)
				}
			}, //hides the comment reply textbox
			cancelComment: function(e) {
				e.preventDefault()
				e.stopPropagation()
				var target = this.$(e.currentTarget)
				var id = target.data('id')
				this.$('#commentreply' + id).hide()
			},

			loadMOAR: function(e) {
				e.preventDefault()
				e.stopPropagation()
				var self = this

				var target = this.$(e.currentTarget)
				var id = target.data('id')

				var children = target.data('children')

				//console.log('loading MOAR')
				var link_id = this.model.get('name')
				//	url: "/api/?url=api/morechildren&cookie=" + $.cookie('reddit_session');,
				var params = {
					link_id: link_id,
					id: id,
					api_type: 'json',
					//sort: 'top',
					children: children,
					//uh: $.cookie('modhash'), 
					byPassAuth: true
				};

				console.log('MOAR=', params)

				//show loading msg
				var parent = this.$('#MOAR' + id)
				this.$(parent).html("<div class='loadingS'></div>")

				this.api("api/morechildren.json", 'POST', params, function(data) {
					//console.log("MOAR done", data)

					if (typeof data !== 'undefined' && typeof data.json !== 'undefined' && typeof data.json.data !== 'undefined' && typeof data.json.data.things !== 'undefined') {
						data.children = data.json.data.things
						var tmpModel = new CommentModel({
							skipParse: true
						})

						var newComments = tmpModel.parseComments(data, link_id)
						this.$(parent).html('') //clear the loading msg
						self.renderComments(newComments, '#MOAR' + id)
					} else {

						self.render()

					}

				});
			},
			// reRenderMOAR: function(newComments) {
			// 	if (typeof newComments !== 'undefined' && newComments.length > 0) {
			// 		//console.log('newcomments=', newComments)
			// 		//pluck the first model in the collection and set it as this model for reRendering
			// 		this.model = newComments.at(0)
			// 		var newComments = newComments.slice(1, newComments.length)
			// 		newComments = new Backbone.Collection(newComments)

			// 		this.model.set('replies', newComments)
			// 		//change template back to normal comment template
			// 		this.template = commentTmpl
			// 		this.render()
			// 		this.renderChildren(this.model.get('replies'))

			// 	}
			// },

			renderComments: function(collection, selector) {
				var self = this;
				collection.each(function(model) {
					var template = ""
					if (model.get('kind') == 'more') {
						var children = model.get('children').join(",")
						model.set('children', children)
						template = self.commentMOAR
					} else {
						template = self.commentONE
					}

					this.$(selector).append(template({
						model: model.attributes
					}))
					var replies = model.get('replies')
					if (typeof replies !== 'undefined' && replies != "" && replies != null) {
						self.renderComments(replies, '#' + model.get('name'))
					}

				})
			},

			/**************Fetching functions ****************/
			fetchError: function(response, error) {
				console.log("fetch error, lets retry")

			},
			fetchMore: function() {

			},

			//called when no model is passed and after the fetch happens
			loaded: function(model, res) {
				this.$('.loading').hide()

				this.render();

			},

		});
		return CommentsView;
	});