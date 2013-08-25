define(['backbone', 'model/comment', 'model/comment-more-link'], function(Backbone, CommentModel, CommentMoreLinkModel) {
	var CommentsCollection = Backbone.Collection.extend({
		model: CommentModel,
		initialize: function(options) {
			this.link_id = options.link_id
			//console.log('init comments COLLECTION,', options)
			this.parseJson(options.children)
		},

		parseJson: function(children) {
			var self = this;
			//console.log('inside of parse comment', collection)
			console.log('children=', children)
			console.log(typeof children.data)

			if (typeof children.data === 'undefined') {
				_.each(children, function(item) {
					// do stuff
					self.parseOne(item)
				});
			} else {

				console.log('children.data is an object')
				this.parseOne(children)

			}

		},
		parseOne: function(item) {
			console.log('one model in the comments collection', item)
			item.data.kind = item.kind //set the kind so we know how to parse it
			if (item.kind == "more") {
				var newMoreLink = new CommentMoreLinkModel(item.data)
				this.push(newMoreLink)
			} else {
				var newComment = new CommentModel(item.data)
				this.push(newComment)
			}
		}

	});
	return CommentsCollection;
});