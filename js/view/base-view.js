define([
  'underscore', 'backbone', 'resthub', 'cookie'],
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
			}

		});
		return BaseView;
	});