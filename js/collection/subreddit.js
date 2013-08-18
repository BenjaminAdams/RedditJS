define(['backbone', 'model/post',"moment"], function(Backbone, PostModel){
	  
    var Post = Backbone.Collection.extend({
		initialize: function(data) {
			console.log(data)
			this.after = ""
			this.subName = data
			this.count = 1

		},
		// Reference to this collection's model.
		model: PostModel,
		
		url: function() {
		if(this.subName=="front"){
			return 'http://api.reddit.com/.json?jsonp=?';		
		}
		else
		{
			return 'http://api.reddit.com/r/'+this.subName+'.json?jsonp=?';
		}
		},
		
		parse: function(response) {
			//console.log(response)
			//set the after for pagination
			this.after = response.data.after;
			
			var self = this;
			var models = Array();
			_.each(response.data.children, function(item) {
				var post = new PostModel(item.data)
				
				var timeAgo = moment.unix(post.get("created")).fromNow(true)  //"true" removes the "ago"
				timeAgo = timeAgo.replace("in ",''); //why would it add the word "in"
				
				post.set("timeAgo",timeAgo)		
				post.set("timeUgly", moment.unix(post.get("created")).format())
				post.set("timePretty", moment.unix(post.get("created")).format("ddd MMM DD HH:mm:ss YYYY") + " UTC")  //format Sun Aug 18 12:51:06 2013 UTC
				//console.log(post)
				
				post.set("count",self.count)	
				//keep track if this is even or odd
				if((self.count %2) == 0)
				{
					post.set("evenOrOdd","even")	
				}else
				{
					post.set("evenOrOdd","odd")	
				}
				
				//so we can have external URLS add data-bypass to the a tag
				if(post.get("is_self")== false)
				{
					post.set("external","data-bypass")
				}
				
				
				//keeps track if the user voted for this or not
				var likes = post.get("likes")
				if(likes == null)
					post.set("voted","unvoted")
				else if(likes===true)
				{
					post.set("voted","likes")
				}else
				{
					post.set("voted","dislikes")
				}
				
				self.count++;
				models.push(post)
			});

			return models;
		},


  });
  return Post;
});
