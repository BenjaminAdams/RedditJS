define(['backbone', 'model/Beers'], function(Backbone, BeersModel){
	  
    var Beers = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: BeersModel,

    url: 'api/beers',



  });
  return Beers;
});
