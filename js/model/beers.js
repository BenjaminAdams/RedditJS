define(['underscore', 'backbone'], function(_, Backbone) {
  var Beer = Backbone.Model.extend({

    // Default attributes 
    defaults: {
	  name: "Beer name",
	  image:"some img",
	  slug: "slug"
    },

  });
  return Beer;
});
