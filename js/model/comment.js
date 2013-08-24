define(['underscore', 'backbone', 'jquery', 'model/base'], function(_, Backbone, $, BaseModel) {
	var Comment = BaseModel.extend({
		initialize: function() {
			this.self = this
		},

		url: function() {
			//http://www.reddit.com/dev/api#POST_api_morechildren
			///api/morechildren
			//return "/api/?url=comments/1kvsi9.json&cookie=" + $.cookie('reddit_session');
		},

		parseComments: function(collection, link_id) {
			var self = this;
			//console.log(collection)

			//comments.before = collection.before
			if (typeof collection !== 'undefined' && typeof collection.children !== 'undefined') {
				var comments = new Backbone.Collection()
				if (typeof collection.after != null) {
					//console.log('got an after=', collection.after)
					comments.after = collection.after
				}

				_.each(collection.children, function(item) {
					if (item.kind == 'more') {
						var data = item.data
						data.kind = item.kind //either "more" or "t1"
						data.childrenCount = item.data.children.length
						data.link_id = link_id
						if (data.childrenCount == 1) {
							data.replyVerb = 'reply'
						} else {
							data.replyVerb = 'replies'
						}
						//var singleModel = new Backbone.Model(data)
						var singleModel = new this.self(data)

						comments.add(singleModel)
					} else {
						var data = item.data
						var timeAgo = moment.unix(data.created).fromNow(true) //"true" removes the "ago"
						timeAgo = timeAgo.replace("in ", ''); //why would it add the word "in"
						data.timeAgo = timeAgo
						data.timeUgly = moment.unix(data.created).format()
						data.timePretty = moment.unix(data.created).format("ddd MMM DD HH:mm:ss YYYY") + " UTC" //format Sun Aug 18 12:51:06 2013 UTC

						data.score = +data.ups + +data.downs
						data.scoreUp = +data.score + 1
						data.scoreDown = +data.score - 1

						data.kind = item.kind //either "more" or "t1"

						data.link_id = link_id

						if (data.likes == null) {
							data.voted = 'unvoted'
							data.downmod = 'down'
							data.upmod = 'up'
						} else if (data.likes === true) {
							data.voted = "likes"
							data.downmod = 'down'
							data.upmod = 'upmod'
						} else {
							data.voted = "dislikes"
							data.downmod = 'downmod'
							data.upmod = 'up'
						}

						data.body_html = (typeof data.body_html === 'undefined') ? '' : $('<div/>').html(data.body_html).text();
						var linkName = data.link_id.replace('t3_', '')
						///r/{{model.subreddit}}/comments/{{model.id}}/is_vox_worth_restarting/cbtb7as
						data.permalink = '/r/' + data.subreddit + '/comments/' + linkName + "#" + data.id

						var singleModel = new Backbone.Model(data)
						//data.replies = this.parseComments(response[1].data.children)
						var replies = singleModel.get('replies')
						if (typeof replies != "undefined" && typeof replies.data != "undefined") {
							var newComments = self.parseComments(replies.data, link_id)
							singleModel.set('childrenCount', newComments.length)
							if (newComments.length == 1) {
								singleModel.set('childOrChildren', 'child')
							} else {
								singleModel.set('childOrChildren', 'children')
							}
							singleModel.set('replies', newComments)
						} else {
							singleModel.set('childOrChildren', 'children')
							singleModel.set('childrenCount', 0)
						}
						comments.add(singleModel)
					}

				})
				return comments
			} else {
				return null
			}

		},

		// Default attributes 
		// defaults: {
		// 	display_name: '',
		// 	description_html: '',

		// },

		//so we have the attributes in the root of the model
		// parse: function(response) {
		// 	data = response.data

		// 	return data;

		// },

	});
	return Comment;
});