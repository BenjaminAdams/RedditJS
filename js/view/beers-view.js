define([
  'underscore', 'backbone', 'resthub', 'hbs!template/beers'],
  function(_, Backbone, Resthub, beersTmpl){
  var BeersView = Resthub.View.extend({
	el:$("#main"),
  
    // Delegated events for creating new items, and clearing completed ones.
    events: {
     // 'click .mark-all-done': 'toggleAllComplete'
    },
    
    template: beersTmpl,

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize: function(options) {
    //  _.bindAll(this, 'addOne', 'addAll', 'render', 'toggleAllComplete');

	this.render();

    },

  });
  return BeersView;
});
