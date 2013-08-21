define(['backbone', 'model/post', "moment"], function(Backbone, PostModel) {

	var Post = Backbone.Collection.extend({
		initialize: function(data) {
			this.after = ""
			this.subName = data
			this.count = 1

		},
		// Reference to this collection's model.
		model: PostModel,

		url: function() {

			if (this.subName == "front") {
				return "/api/?url=.json&cookie=" + $.cookie('reddit_session');
				//return 'http://api.reddit.com/.json?jsonp=?';		
			} else {
				return '/api/?url=r/' + this.subName + ".json&cookie=" + $.cookie('reddit_session');
				//return 'http://api.reddit.com/r/'+this.subName+'.json?jsonp=?';
			}
		},

		parse: function(response) {
			//set the after for pagination
			this.after = response.data.after;
			var modhash = response.data.modhash;
			if (typeof modhash == "string" && modhash.length > 5) {
				$.cookie('modhash', modhash);
			}

			var self = this;
			var models = Array();
			_.each(response.data.children, function(item) {
				var post = new PostModel(item.data)
				if (post.get('hidden') == true) //skip loading this if the user has it hidden
				{
					//continue;  //cant use continue in _.each
				} else {

					var timeAgo = moment.unix(post.get("created")).fromNow(true) //"true" removes the "ago"
					timeAgo = timeAgo.replace("in ", ''); //why would it add the word "in"

					post.set("timeAgo", timeAgo)
					post.set("timeUgly", moment.unix(post.get("created")).format())
					post.set("timePretty", moment.unix(post.get("created")).format("ddd MMM DD HH:mm:ss YYYY") + " UTC") //format Sun Aug 18 12:51:06 2013 UTC
					//console.log(post)

					post.set("count", self.count)
					//keep track if this is even or odd
					if ((self.count % 2) == 0) {
						post.set("evenOrOdd", "even")
					} else {
						post.set("evenOrOdd", "odd")
					}

					//so we can have external URLS add data-bypass to the a tag
					if (post.get("is_self") == false) {
						post.set("external", "data-bypass")
					}

					/*keeps track if the user voted for this or not
						putting the class upmod makes the vote count as an upvote
						downmod makes the vote show as a downvote
						leave the classes as "down" and "up" to leave the no vote option

					*/
					var likes = post.get("likes")
					if (likes == null) {
						post.set("voted", "unvoted")
						post.set('downmod', 'down')
						post.set('upmod', 'up')
					} else if (likes === true) {
						post.set("voted", "likes")
						post.set('downmod', 'down')
						post.set('upmod', 'upmod')
					} else {
						post.set("voted", "dislikes")
						post.set('downmod', 'downmod')
						post.set('upmod', 'up')
					}

					//We have to print the score out for the upvoted and downvoted values
					var score = post.get('score');
					post.set("scoreUp", +score + 1)
					post.set("scoreDown", +score - 1)

					//figure out if we need to use a default thumbnail

					if (post.get('thumbnail') == 'self') {
						post.set('thumbnail', 'img/self.png')
					} else if (post.get('thumbnail') == 'nsfw') {
						post.set('thumbnail', 'img/nsfw.png')
					} else if (post.get('thumbnail') == '' || post.get('thumbnail') == 'default') {
						post.set('thumbnail', 'img/notsure.png')
					}

					self.count++;
				}
				models.push(post)
			});

			return models;
		},

	});
	return Post;
});