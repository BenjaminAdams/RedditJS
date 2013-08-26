define([
  'underscore', 'backbone', 'resthub', 'hbs!template/comment', 'hbs!template/commentMOAR', 'view/base-view', 'model/comment', 'event/channel', 'cookie'],
	function(_, Backbone, Resthub, commentTmpl, CommentMOAR, BaseView, CommentModel, channel, Cookie) {
		var CommentView = BaseView.extend({
			//strategy: 'append',

			events: function() {
				var _events = {
					'click .noncollapsed .expand': "hideThread",
					'click .collapsed .expand': "showThread",
					'click .cancel': 'hideUserInput'
				};
				_events['click .upArrow' + this.options.id] = "upvote";
				_events['click .downArrow' + this.options.id] = "downvote";
				_events['click .MOAR' + this.options.id] = "loadMOAR";
				_events['click #replyToggle' + this.options.id] = "toggleReply";

				_events['click #mdHelpShow' + this.options.id] = "showMdHelp";
				_events['click #mdHelpHide' + this.options.id] = "hideMdHelp";
				return _events;
			},

			// events: {
			// 	'click .downArrow': 'downvote',
			// 'click .noncollapsed .expand': "hideThread",
			// 'click .collapsed .expand': "showThread"
			// 	//  'keyup #new-todo':     'showTooltip'
			// },

			initialize: function(options) {
				_.bindAll(this);
				var self = this;
				//this.collection = options.collection
				this.model = options.model
				this.name = this.model.get('name')
				this.id = this.model.get('id')
				if (this.model.get('kind') == 'more') {
					this.template = CommentMOAR
				} else {
					this.template = commentTmpl
				}

				this.render();
				//console.log("trying to create a new comment view with = ", options)

				this.renderChildren(this.model.get('replies'))

			},
			loadMOAR: function(e) {
				e.preventDefault()
				e.stopPropagation()
				$(this.el).html("<div class='loadingS'></div>")
				var self = this
				//console.log('loading MOAR')
				var link_id = this.model.get('link_id')
				//	url: "/api/?url=api/morechildren&cookie=" + $.cookie('reddit_session');,
				var params = {
					link_id: link_id,
					id: this.id,
					api_type: 'json',
					//sort: 'top',
					children: this.model.get('children').join(","),
					//uh: $.cookie('modhash'), 
					byPassAuth: true
				};
				console.log('MOAR=', params)

				this.api("api/morechildren.json", 'POST', params, function(data) {
					console.log("MOAR done", data)

					if (typeof data !== 'undefined' && typeof data.json !== 'undefined' && typeof data.json.data !== 'undefined' && typeof data.json.data.things !== 'undefined') {
						data.children = data.json.data.things
						var tmpModel = new CommentModel({
							skipParse: true
						})

						var newComments = tmpModel.parseComments(data, link_id)
						self.reRenderMOAR(newComments)
					} else {

						self.render()

					}

				});
			},
			reRenderMOAR: function(newComments) {
				if (typeof newComments !== 'undefined' && newComments.length > 0) {
					//console.log('newcomments=', newComments)
					//pluck the first model in the collection and set it as this model for reRendering
					this.model = newComments.at(0)
					var newComments = newComments.slice(1, newComments.length)
					newComments = new Backbone.Collection(newComments)

					this.model.set('replies', newComments)
					//change template back to normal comment template
					this.template = commentTmpl
					this.render()
					this.renderChildren(this.model.get('replies'))

				}
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

			},
			//shows the comment reply textbox
			toggleReply: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('#commentreply' + this.model.get('id')).toggle()
			},
			//hides the comment reply textbox
			hideUserInput: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('#commentreply' + this.model.get('id')).hide()
			},
			//shows the user markdown help 
			showMdHelp: function(e) {
				e.preventDefault()
				e.stopPropagation()

				var mdHelp = '<p></p><p>reddit uses a slightly-customized version of <a href="http://daringfireball.net/projects/markdown/syntax">Markdown</a> for formatting. See below for some basics, or check <a href="/wiki/commenting">the commenting wiki page</a> for more detailed help and solutions to common issues.</p><p></p><table class="md"><tbody><tr style="background-color: #ffff99;text-align: center"><td><em>you type:</em></td><td><em>you see:</em></td></tr><tr><td>*italics*</td><td><em>italics</em></td></tr><tr><td>**bold**</td><td><b>bold</b></td></tr><tr><td>[reddit!](http://reddit.com)</td><td><a href="http://reddit.com">reddit!</a></td></tr><tr><td>* item 1<br>* item 2<br>* item 3</td><td><ul><li>item 1</li><li>item 2</li><li>item 3</li></ul></td></tr><tr><td>>quoted text</td><td><blockquote>quoted text</blockquote></td></tr><tr><td>Lines starting with four spaces<br>are treated like code:<br><br><span class="spaces">    </span>if 1 * 2 <3:<br><span class="spaces">        </span>print "hello, world!"<br></td><td>Lines starting with four spaces<br>are treated like code:<br><pre>if 1 * 2 <3:<br>    print "hello, world!"</pre></td></tr><tr><td>~~strikethrough~~</td><td><strike>strikethrough</strike></td></tr><tr><td>super^script</td><td>super<sup>script</sup></td></tr></tbody></table></div></div></form>'
				this.$('#mdHelp' + this.model.get('id')).html(mdHelp).show()
				this.$('#mdHelpShow' + this.model.get('id')).hide()
				this.$('#mdHelpHide' + this.model.get('id')).show()
			},
			hideMdHelp: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('#mdHelpShow' + this.model.get('id')).show()
				this.$('#mdHelpHide' + this.model.get('id')).hide()
				this.$('#mdHelp' + this.model.get('id')).html('')
			},

			renderChildren: function(replies) {
				//var replies = this.model.get('replies')
				if (typeof replies !== 'undefined' && replies != "" && replies != null) {
					var self = this

					replies.each(function(model) {
						var id = model.get('id')
						if (id != "_") {
							var comment = new CommentView({
								model: model,
								id: id,
								strategy: "append",
								root: "#" + self.name
							})
						}

					})

				}
			},
			/**************Fetching functions ****************/
			fetchError: function(response, error) {
				console.log("fetch error, lets retry")

			},
			fetchMore: function() {

			},

			loaded: function(model, res) {
				this.$('.loading').hide()

				this.render();

			},

		});
		return CommentView;
	});