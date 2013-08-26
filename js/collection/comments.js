define(['backbone', 'model/comment', 'model/comment-more-link'], function(Backbone, CommentModel, CommentMoreLinkModel) {
	var CommentsCollection = Backbone.Collection.extend({
		//model: CommentModel,
		initialize: function(options) {
			//this.link_id = options.link_id
			//console.log('init comments COLLECTION,', options)
			//this.parseJson()
		},
		parseAlloldoldold: function() {
			var self = this;
			this.each(function(item) {
				// do stuff
				newModels.push(self.parseOne(item))
			});

		},
		parseAlloldoldold: function() {
			var self = this;
			console.log('inside of parse comment', this)

			if (typeof children.data === 'undefined') {
				this.each(function(item) {
					// do stuff
					newModels.push(self.parseOne(item))
				});
			}
			console.log('adding new models', newModels)
			//this.models = newModels
			this.add(newModels)
			console.log('this after adding them...=', this) //problem here, 'this' is not correct

		},
		parseOne: function(item) {
			console.log('one model in the comments collection', item)
			console.log('this inside of parse one=', this)
			item.data.kind = item.kind //set the kind so we know how to parse it
			if (item.kind == "more") {
				var newMoreLink = new CommentMoreLinkModel(item.data)
				return newMoreLink
			} else {
				console.log("THIS IS A T1", item)
				var newComment = new CommentModel(item.data)
				console.log("RESPONSE FROM CREATING A T1=", newComment)
				return newComment
			}
			console.log('this inside of parse one AFTER=', this)
		}

	});
	return CommentsCollection;
});