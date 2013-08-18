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
    _.bindAll(this);
	this.collection = new SubredditCollection();
	this.template = subredditTmpl;
	this.render();

	this.collection.fetch({success : this.loaded});
	


    },
	
	loaded: function(response, posts){
	//	console.log(posts)
		this.renderPosts()
	},
	renderPosts: function() {
		console.log(this.collection)
	},
	

  });
  return SubredditView;
});
