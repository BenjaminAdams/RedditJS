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

					data.body_html = (typeof data.body_html === 'undefined') ? '' : $('<div/>').html(data.body_html).text();

					var singleModel = new Backbone.Model(data)
					//data.replies = this.parseComments(response[1].data.children)
					var replies = singleModel.get('replies')
					if (typeof replies != "undefined" && typeof replies.data != "undefined") {
						var newComments = self.parseComments(replies.data)
						singleModel.set('replies', newComments)
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