define([
  'underscore', 'backbone', 'resthub', 'hbs!template/subreddit', 'collection/subreddit'],
  function(_, Backbone, Resthub, subredditTmpl,SubredditCollection){
  var SubredditView = Resthub.View.extend({
	el:$("#main"),
	template: subredditTmpl,
    events: {
     // 'click .mark-all-done': 'toggleAllComplete'
    },
    initialize: function(options) {
    //  _.bindAll(this, 'addOne', 'addAll', 'render', 'toggleAllComplete');
	this.collection = new SubredditCollection();
	this.template = subredditTmpl;
	this.render();

    },

  });
  return SubredditView;
});
