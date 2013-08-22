define(['backbone', 'model/post', "moment"], function(Backbone, PostModel) {

	var Post = Backbone.Collection.extend({
		initialize: function(data) {
			_.bindAll(this);
			this.after = ""
			this.subName = data
			this.count = 1
			this.instanceUrl = this.getUrl()

		},
		// Reference to this collection's model.
		model: PostModel,

		url: function() {

			return this.instanceUrl //keeps a dynamic URL so we can give it a new "after"
		},

		getUrl: function() {

			if (this.subName == "front") {
				return "/api/?url=.json?after=" + this.after + "&cookie=" + $.cookie('reddit_session');
				//return 'http://api.reddit.com/.json?jsonp=?';		
			} else {
				console.log('/api/?url=r/' + this.subName + ".json?after=" + this.after + "&cookie=" + $.cookie('reddit_session'))
				return '/api/?url=r/' + this.subName + ".json?after=" + this.after + "&cookie=" + $.cookie('reddit_session');
				//return 'http://api.reddit.com/r/'+this.subName+'.json?jsonp=?';
			}
		},

		parse: function(response) {
			//set the after for pagination
			this.after = response.data.after;

			if (this.after == "" || this.after == null) {
				this.after = "stop" //tells us we have finished downloading all of the possible posts in this subreddit
			}

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

					//figure out a URL that we can embed in an image tag
					var imgUrl = post.get("url")
					if (self.checkIsImg(imgUrl) == false) {
						//URL is NOT an image
						//try and fix an imgur link?
						imgUrl = self.fixImgur(imgUrl)

					}
					post.set('imgUrl', imgUrl)

					self.count++;
				}
				models.push(post)
			});

			//reset the url to have the new after tag
			this.instanceUrl = this.getUrl()
			return models;
		},
		checkIsImg: function(url) {
			return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
		},
		fixImgur: function(url) {
			if (this.containsStr("imgur.com", url)) {
				//check if its a gallery
				if (this.containsStr("imgur.com/a", url)) {
					console.log("its a gallery=", url)
					return false
				} else {
					return url + ".jpg"
				}
				console.log("i got here!")
			}
		},
		containsStr: function(needle, haystack) {
			return (haystack.indexOf(needle) >= 0)
		}

	});
	return Post;
});