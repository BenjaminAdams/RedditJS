define([
  'underscore', 'backbone', 'resthub', 'hbs!template/comments', 'view/comment-view', 'hbs!template/comment', 'view/base-view', 'collection/comments', 'model/comment', 'event/channel', 'cookie'],
	function(_, Backbone, Resthub, commentsTmpl, CommentView, commentTmpl, BaseView, CommentCollection, CommentModel, channel, Cookie) {
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

				this.collection = options.collection
				this.render();
				this.renderComments(this.collection, '#commentarea')
				this.model = options.model
				//console.log('init comments view model=', this.model)

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

			renderComments: function(collection, selector) {
				var self = this;
				collection.each(function(model) {
					//console.log('model in renderComments', model)
					// var comment = new CommentView({
					// 	model: model,
					// 	id: model.get('id'),
					// 	strategy: "append",
					// 	root: "#siteTableComments"
					// 	//root: "#commentarea"
					// })
					this.$(selector).append(commentTmpl({
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