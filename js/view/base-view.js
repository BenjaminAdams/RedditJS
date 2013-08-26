define(['underscore', 'backbone', 'resthub', 'cookie'],
	function(_, Backbone, Resthub, Cookie) {
		var BaseView = Resthub.View.extend({

			destroy: function() {
				console.log("destroying a view")
				this.remove();
				this.unbind();
			},
			api: function(url, type, params, callback) {
				if (this.checkIfLoggedIn() == true || params.byPassAuth == true) {
					var cookie = $.cookie('reddit_session');

					$.ajax({
						url: "/api/index.php?url=" + url + "&cookie=" + cookie,
						type: type,
						dataType: "json",
						data: params,
						success: function(data) {
							callback(data)
						},
						error: function(data) {
							console.log("ERROR inrequest details: ", data);
							callback(data)

						}
					});
				} else {
					console.log("params in not logged in", params)
					alert("Please login to do that")
				}
			},
			checkIfLoggedIn: function() {
				var username = $.cookie('username')
				if (typeof username == "string" && username.length > 2) {
					return true;
				} else {
					return false;
				}
			}, //so we resize it does not do a resize for every pixel the user resizes
			//it has a timeout that fires after the user is done resizing
			debouncer: function(func, timeout) {
				var timeoutID, timeout = timeout || 20;
				return function() {
					var scope = this,
						args = arguments;
					clearTimeout(timeoutID);
					timeoutID = setTimeout(function() {
						func.apply(scope, Array.prototype.slice.call(args));
					}, timeout);
				}
			},
			//smooth scrolling to the top of the screen
			scrollTop: function() {
				console.log('scrolltop now')
				$('html, body').animate({
					scrollTop: 0
				}, 600);
			},
			dynamicStylesheet: function(name) {
				if (this.subName == 'front') {
					$("#subredditStyle").attr("href", "");
				} else {
					$("#subredditStyle").attr("href", "http://www.reddit.com/r/" + this.subName + "/stylesheet");
				}
			},
			//Can be used to vote on a post or a comment
			vote: function(dir, id) {

				var params = {
					id: id,
					dir: dir,
					uh: $.cookie('modhash'),
				};

				console.log(params)

				this.api("api/vote", 'POST', params, function(data) {
					console.log("vote done", data)
				});
			},
			upvote: function(e) {
				e.preventDefault()
				e.stopPropagation()

				console.log('upvoting', this.model)

				if (typeof this.model !== 'undefined' && this.model.get('likes') == false || this.model.get('likes') == null) {
					this.vote(1, this.model.get('name'))
					var id = this.model.get('id')
					this.model.set('likes', true)
					this.model.set('downmod', 'down')
					this.model.set('upmod', 'upmod')
					this.$('.midcol .dislikes').hide()
					this.$('.midcol .likes').show()
					this.$('.midcol .unvoted').hide()

					this.$('.upArrow' + id).addClass('upmod')
					this.$('.upArrow' + id).removeClass('up')
					this.$('.downArrow' + id).addClass('down')
					this.$('.downArrow' + id).removeClass('downmod')

				} else {
					this.cancelVote()
				}
			},
			downvote: function(e) {
				e.preventDefault()
				e.stopPropagation()
				if (this.model.get('likes') == true || this.model.get('likes') == null) {

					this.vote(-1, this.model.get('name'))
					var id = this.model.get('id')
					this.model.set('likes', false)
					this.model.set('downmod', 'downmod')
					this.model.set('upmod', 'up')

					this.$('.midcol .dislikes').show()
					this.$('.midcol .likes').hide()
					this.$('.midcol .unvoted').hide()

					this.$('.upArrow' + id).addClass('up')
					this.$('.upArrow' + id).removeClass('upmod')
					this.$('.downArrow' + id).addClass('downmod')
					this.$('.downArrow' + id).removeClass('down')

				} else {
					this.cancelVote()
				}
			},
			cancelVote: function() {
				this.vote(0, this.model.get('name'))
				var id = this.model.get('id')
				this.model.set('likes', null)
				this.model.set('downmod', 'down')
				this.model.set('upmod', 'up')
				this.$('.midcol .dislikes').hide()
				this.$('.midcol .likes').hide()
				this.$('.midcol .unvoted').show()

				this.$('.upArrow' + id).addClass('up')
				this.$('.upArrow' + id).removeClass('upmod')
				this.$('.downArrow' + id).addClass('down')
				this.$('.downArrow' + id).removeClass('downmod')
			},
			save: function(id) {
				var params = {
					id: id,
					dir: dir,
					uh: $.cookie('modhash'),
				};

				this.api("api/vote", 'POST', params, function(data) {
					console.log("saving done", data)
				});
			},
			//attempts to create a new comment
			comment: function(e) {
				e.preventDefault()
				e.stopPropagation()
				var self = this

				var id = this.model.get('name')
				var text = this.$('#text' + id).val()
				console.log("text from user input=", text)
				text = this.sterilize(text) //clean the input

				var params = {
					api_type: 'json',
					thing_id: id,
					text: text,
					uh: $.cookie('modhash'),
				};
				console.log(params)

				this.api("/api/comment", 'POST', params, function(data) {
					console.log("comment done", data)
					self.commentCallback(data)
				});
			}, //callback after trying to write a comment
			commentCallback: function(data) {
				console.log('callback comment=', data)
				CommentModel = require('model/comment') //in order to have nested models inside of models we need to do this
				CommentView = require('view/comment-view') //in cases of recursion its ok!

				//post comment to have the new ID from this data 
				if (typeof data !== 'undefined' && typeof data.json !== 'undefined' && typeof data.json.data !== 'undefined' && typeof data.json.data.things !== 'undefined') {
					//status{{model.name}}
					this.$('.status' + this.model.get('name')).html('<span class="success">success!</span>')
					//data.json.data.things[0].data.link_id = this.model.get('name')
					var attributes = data.json.data.things[0].data
					attributes.author = $.cookie('username');

					//this if statement will only fire during a comment callback
					attributes.body_html = attributes.contentHTML
					attributes.name = attributes.id
					attributes.link_id = attributes.link
					attributes.likes = true
					attributes.subreddit = this.model.get('subreddit')
					attributes.smallid = attributes.id.replace('t1_', '')
					attributes.smallid = attributes.id.replace('t3_', '')
					attributes.permalink = '/r/' + data.subreddit + '/comments/' + attributes.link_id + "#" + data.id

					//clear the users text
					this.$('#text' + attributes.link_id).val("")

					var newModel = new CommentModel(attributes) //shouldn't have to input this data into the model twice
					this.hideUserInput()
					//child{{model.name}}
					var comment = new CommentView({
						model: newModel,
						id: newModel.get('id'),
						strategy: "prepend",
						root: ".child" + this.model.get('name') //append this comment to the end of this at the child
					})

				} else {
					this.$('.status' + this.model.get('name')).html('error ' + data)
				}
			}, //hides the comment reply textbox
			hideUserInput: function(e) {
				if (typeof e !== 'undefined') {
					e.preventDefault()
					e.stopPropagation()
				}
				this.$('#commentreply' + this.model.get('id')).hide()
			},

			//sterilizes user input 
			sterilize: function(HTMLString) {
				HTMLString = HTMLString.replace(/<img /gi, "<imga ");
				var att, x = 0,
					y, coll, c = [],
					probe = document.createElement("div");
				probe.innerHTML = HTMLString;
				coll = probe.getElementsByTagName("*");
				while (coll[x]) coll[x] ? c.push(coll[x++]) : 0;
				for (x in c)
					if (/(script|object|embed|iframe)/i.
						/*you can blacklist more tags here!*/
						test(c[x].tagName)) {
						c[x].outerHTML = "";
					} else {
						if (c[x].href) /java/.test(coll[x].protocol) ? c[x].href = "#" : 0;
						att = c[x].attributes;
						for (y in att)
							if (att[y])
								if (/(^on|style)/i.test(att[y].name))
									c[x].removeAttribute(att[y].name);
					}
				c = probe.innerHTML.replace(/imga/gi, "img");
				return c.replace(/<\/img>/gi, "");
			}, //shows the user markdown help 
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

			//so users can report spam
			reportShow: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('#reportConfirm' + this.model.get('id')).toggle()
			},
			reportYes: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('#reportConfirm' + this.model.get('id')).hide()
				var params = {
					id: this.model.get('name'),
					uh: $.cookie('modhash'),
				};
				console.log(params)

				this.api("/api/report", 'POST', params, function(data) {
					console.log("report done", data)

				});
			},
			//so users can hide a post/link 
			hidePost: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('div[data-fullname=' + this.model.get('name') + ']').hide()
				var params = {
					id: this.model.get('name'),
					uh: $.cookie('modhash'),
				};
				console.log(params)

				this.api("/api/hide", 'POST', params, function(data) {
					console.log("hide done", data)

				});
			},
			//so users can hide a post/link 
			savePost: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('#save' + this.model.get('id')).hide()
				this.$('#unsave' + this.model.get('id')).show()
				var params = {
					id: this.model.get('name'),
					uh: $.cookie('modhash'),
				};
				console.log(params)

				this.api("/api/save", 'POST', params, function(data) {
					console.log("save done", data)

				});
			}, //so users can hide a post/link 
			unSavePost: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('#save' + this.model.get('id')).show()
				this.$('#unsave' + this.model.get('id')).hide()
				var params = {
					id: this.model.get('name'),
					uh: $.cookie('modhash'),
				};
				console.log(params)

				this.api("/api/unsave", 'POST', params, function(data) {
					console.log("unsave done", data)

				});
			},

		});
		return BaseView;
	});