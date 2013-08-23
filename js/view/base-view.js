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
			},
			//Can be used to vote on a post or a comment
			vote: function(dir, id) {

				var params = {
					id: id,
					dir: dir,
					uh: $.cookie('modhash'),
				};

				this.api("api/vote", 'POST', params, function(data) {
					console.log("vote done", data)
				});
			},
			upvote: function() {
				console.log('upvoting', this.model)
				if (this.model.get('likes') == false || this.model.get('likes') == null) {
					this.vote(1, this.model.get('name'))
					this.model.set('likes', true)
					this.model.set('downmod', 'down')
					this.model.set('upmod', 'upmod')
					this.$('.midcol .dislikes').hide()
					this.$('.midcol .likes').show()
					this.$('.midcol .unvoted').hide()

					this.$('.upArrow').addClass('upmod')
					this.$('.upArrow').removeClass('up')
					this.$('.downArrow').addClass('down')
					this.$('.downArrow').removeClass('downmod')

				} else {
					this.cancelVote()
				}
			},
			downvote: function() {
				if (this.model.get('likes') == true || this.model.get('likes') == null) {

					this.vote(-1, this.model.get('name'))
					this.model.set('likes', false)
					this.model.set('downmod', 'downmod')
					this.model.set('upmod', 'up')

					this.$('.midcol .dislikes').show()
					this.$('.midcol .likes').hide()
					this.$('.midcol .unvoted').hide()

					this.$('.upArrow').addClass('up')
					this.$('.upArrow').removeClass('upmod')
					this.$('.downArrow').addClass('downmod')
					this.$('.downArrow').removeClass('down')

				} else {
					this.cancelVote()
				}
			},
			cancelVote: function() {
				this.vote(0, this.model.get('name'))
				this.model.set('likes', null)
				this.model.set('downmod', 'down')
				this.model.set('upmod', 'up')
				this.$('.midcol .dislikes').hide()
				this.$('.midcol .likes').hide()
				this.$('.midcol .unvoted').show()

				this.$('.upArrow').addClass('up')
				this.$('.upArrow').removeClass('upmod')
				this.$('.downArrow').addClass('down')
				this.$('.downArrow').removeClass('downmod')
			}

		});
		return BaseView;
	});