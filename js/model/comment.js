define(['underscore', 'backbone', 'jquery', 'collection/comments', 'model/comment-more-link', 'model/comment', 'model/base'], function(_, Backbone, $, CommentsCollection, CommentMoreLinkModel, CommentModel, BaseModel) {
	var CommentModel = BaseModel.extend({
		initialize: function(options) {
			//this.self = this
			//console.log('comment model INIT', this)

			if (typeof options.skipParse === 'undefined') {
				this.parseThis()
			}
		},
		parseThis: function() {
			//console.log('inside CommentModel', this)
			var data = this.attributes
			//console.log('data in start of comment model=', data)
			//these are variables we cant parse sometimes because after a new 
			//comment is created by the user we have limited data coming back

			var timeAgo = moment.unix(data.created).fromNow(true) //"true" removes the "ago"
			timeAgo = timeAgo.replace("in ", ''); //why would it add the word "in"
			data.timeAgo = timeAgo
			data.timeUgly = moment.unix(data.created).format()
			data.timePretty = moment.unix(data.created).format("ddd MMM DD HH:mm:ss YYYY") + " UTC" //format Sun Aug 18 12:51:06 2013 UTC

			data.score = +data.ups + +data.downs
			data.scoreUp = +data.score + 1
			data.scoreDown = +data.score - 1

			data.kind = "t1" //either "more" or "t1"

			//data.link_id = link_id

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

			//data.replies = this.parseComments(response[1].data.children)

			if (typeof data.replies !== "undefined" && data.replies != null && typeof data.replies.data !== "undefined") {
				//var newComments = self.parseComments(replies.data, link_id)
				// CommentsCollection = require('collection/comments')
				// CommentModel = require('model/comment')

				//console.log('about to declare a collection inside a model', data)
				//var newComments = new CommentsCollection()
				//console.log('datareplies', data.replies.data)
				data.replies = this.parseComments(data.replies.data, data.link_id)
				//data.replies = newComments
				//now parse it in the collection itself

				// var newComments = new CommentsCollection({
				// 	children: data.replies.data.children,
				// 	link_id: data.link_id
				// })

				data.childrenCount = data.replies.length
				if (data.replies.length == 1) {
					data.childOrChildren = 'child'
				} else {
					data.childOrChildren = 'children'
				}

			} else {
				data.childOrChildren = 'children'
				data.childrenCount = 0
			}

			this.attributes = data
		},

	});
	return CommentModel;
});