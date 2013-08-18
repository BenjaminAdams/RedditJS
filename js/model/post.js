define(['underscore', 'backbone'], function(_, Backbone) {
  var Post = Backbone.Model.extend({

    // Default attributes 
    defaults: {
	  name: "Beer name",
	  image:"some img",
	  slug: "slug"
    },

  });
  return Post;
});
