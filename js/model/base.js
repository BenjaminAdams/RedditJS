define(['underscore', 'backbone', 'jquery'], function(_, Backbone, $) {
	var Base = Backbone.Model.extend({

		// Default attributes 
		// defaults: {
		// 	display_name: '',
		// 	description_html: '',

		// },
		parseComments: function(collection) {
			var self = this;
			//console.log(collection)
			//comments.after = collection.after
			//comments.before = collection.before
			if (typeof collection !== 'undefined' && typeof collection.children !== 'undefined') {
				var comments = new Backbone.Collection()
				_.each(collection.children, function(item) {
					//console.log(item.data)
					var data = item.data
					var timeAgo = moment.unix(data.created).fromNow(true) //"true" removes the "ago"
					timeAgo = timeAgo.replace("in ", ''); //why would it add the word "in"
					data.timeAgo = timeAgo
					data.timeUgly = moment.unix(data.created).format()
					data.timePretty = moment.unix(data.created).format("ddd MMM DD HH:mm:ss YYYY") + " UTC" //format Sun Aug 18 12:51:06 2013 UTC

					data.score = +data.ups + +data.downs
					data.scoreUp = +data.score + 1
					data.scoreDown = +data.score - 1

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
						var newComments = self.parseComments(replies.data)
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
				})
				return comments
			} else {
				return null
			}

		},

	});
	return Base;
});