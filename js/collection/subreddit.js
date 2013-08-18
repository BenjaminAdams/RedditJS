define(['backbone', 'model/Post'], function(Backbone, PostModel){
	  
    var Post = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: PostModel,

    url: 'http://www.reddit.com/r/funny.json',



  });
  return Post;
});
