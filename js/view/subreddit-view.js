define([
  'underscore', 'backbone', 'resthub', 'hbs!template/subreddit', 'view/post-row-view', 'view/sidebar-view', 'collection/subreddit'],
  function(_, Backbone, Resthub, subredditTmpl, PostRowView, SidebarView, SubredditCollection){
  var SubredditView = Resthub.View.extend({
  
	el:$("#main"),
	template: subredditTmpl,
	
    events: {
     // 'click .mark-all-done': 'toggleAllComplete'
    },
	
    initialize: function(options) {
    _.bindAll(this);
	this.subName = options.subName
	this.collection = new SubredditCollection(this.subName);
	this.template = subredditTmpl;
	this.render();
	
	//load sidebar
	this.sidebar = new SidebarView({subName:this.subName, root: ".side" })


	this.collection.fetch({success : this.loaded});
	
    },
	
	loaded: function(response, posts){
	//	console.log(posts)
		this.renderPosts()
	},
	renderPosts: function() {
		console.log(this.collection)
		var self = this;
		this.collection.each(function(model) {
			var postview = new PostRowView({ root: "#siteTable", model: model}); 
			//self.$("#siteTable").append(postview)
           // var post = new PostRowView(model)
        }, this);
	},
	

  });
  return SubredditView;
});
