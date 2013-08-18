define(['backbone', 'model/post'], function(Backbone, PostModel){
	  
    var Post = Backbone.Collection.extend({
		initialize: function(data) {
			console.log(data)
			this.after = ""
			this.subName = data

		},
		// Reference to this collection's model.
		model: PostModel,
		
		url: function() {
			return 'http://api.reddit.com/r/'+this.subName+'.json?jsonp=?';
		},
		
		parse: function(response) {
			//console.log(response)
			//set the after for pagination
			this.after = response.data.after;
			
			var self = this;
			var models = Array();
			_.each(response.data.children, function(item) {
				var post = new PostModel(item.data)
				//console.log(post)
				models.push(post)
			});

			return models;
		},


  });
  return Post;
});
