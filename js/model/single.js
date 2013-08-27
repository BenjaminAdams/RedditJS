define(['underscore', 'backbone', 'collection/comments', 'model/base'], function(_, Backbone, CommentsCollection, BaseModel) {
	var Single = BaseModel.extend({
		initialize: function(data) {
			this.id = data.id
			this.parseNow = data.parseNow

		},
		url: function() {
			return "/api/?url=comments/" + this.id + ".json&cookie=" + $.cookie('reddit_session');
		},
		// Default attributes 
		defaults: {
			// name: "Beer name",
			// image:"some img",
			//  slug: "slug"
		},
		parse: function(response) {
			if (this.parseNow == true) {
				response = this.parseOnce(response)
			}
			return response
		},
		//so we have the attributes in the root of the model
		parseOnce: function(response) {
			var data;
			//console.log("RESPONSE of single model", response)
			if (typeof response[0] === 'undefined') {
				data = response
			} else {

				//set the value for the single reddit post
				data = response[0].data.children[0].data
				//set the values for the comments of this post
				data.replies = this.parseComments(response[1].data, data.name)
			}

			var timeAgo = moment.unix(data.created).fromNow(true) //"true" removes the "ago"
			timeAgo = timeAgo.replace("in ", ''); //why would it add the word "in"
			data.timeAgo = timeAgo
			data.timeUgly = moment.unix(data.created).format()
			data.timePretty = moment.unix(data.created).format("ddd MMM DD HH:mm:ss YYYY") + " UTC" //format Sun Aug 18 12:51:06 2013 UTC
			data.rname = "/r/" + data.subreddit
			//data.selftextMD = markdown.toHTML(this.decodeHTMLEntities(data.selftext))

			//so we can have external URLS add data-bypass to the a tag
			data.selftext_html = (typeof data.selftext_html === 'undefined') ? '' : $('<div/>').html(data.selftext_html).text();

			if (data.thumbnail == 'self') {
				data.thumbnail = 'img/self.png'
			} else if (data.thumbnail == 'nsfw') {
				data.thumbnail = 'img/nsfw.png'
			} else if (data.thumbnail == '' || data.thumbnail == 'default') {
				data.thumbnail = 'img/notsure.png'
			}

			/*keeps track if the user voted for this or not
				putting the class upmod makes the vote count as an upvote
				downmod makes the vote show as a downvote
				leave the classes as "down" and "up" to leave the no vote option
			*/
			if (data.likes == null) {
				data.voted = 'unvoted'
				data.downmod = 'down'
				data.upmod = 'up'
			} else if (data.likes === true) {
				data.voted = "likes"
				data.downmod = 'down'
				data.upmod = 'upmod'
			} else {
				data.voted = "dislikes"
				data.downmod = 'downmod'
				data.upmod = 'up'
			}

			//We have to print the score out for the upvoted and downvoted values
			var score = data.score
			data.scoreUp = +score + 1
			data.scoreDown = +score - 1

			//figure out a URL that we can embed in an image tag
			var imgUrl = data.url
			if (this.checkIsImg(imgUrl) == false) {
				//URL is NOT an image
				//try and fix an imgur link?
				imgUrl = this.fixImgur(imgUrl)

			}
			data.imgUrl = imgUrl

			var expandedOrCollapsed = 'expanded' //values can be expaned or collapsed
			data.expandHTML = ""
			data.embededImg = false // if its a single image/video we can embed into a single post view

			if (typeof data.media_embed.content === 'undefined' && data.is_self == false && data.imgUrl != false) {
				//this is a single image we can embed
				data.embededImg = true
				data.media_embed = new Array()
				data.media_embed.content = "<div class='embed'><p><a data-bypass  href='" + data.url + "' target='_blank'> <img src='" + data.imgUrl + "' /> </a></p></div>"
				data.expandHTML = "<li><div class='expando-button " + expandedOrCollapsed + " video'></div></li>"

			} else if (typeof data.media_embed.content !== 'undefined') {
				//if it has embed content, lets embed it
				data.embededImg = true
				data.media_embed.content = $('<div/>').html(data.media_embed.content).text();
				//data.media_embed.content = "<div class='embed'><p><a data-bypass  href='" + data.url + "' target='_blank'> <img src='" + data.imgUrl + "' /> </a></p></div>"
				data.expandHTML = "<li><div class='expando-button " + expandedOrCollapsed + " video'></div></li>"

			} else {
				data.media_embed.content = ""
			}

			if (data.is_self == true) {
				//data.external = 'data-bypass'
				data.actualUrl = data.url
				data.url = data.permalink
			} else if (data.embededImg == true) {
				//change the users URL link if its an embeded image/video type
				data.actualUrl = data.permalink
				data.url = data.permalink
				data.external = ''
			} else {
				//this is not a post we can embed
				data.actualUrl = data.url
				data.external = 'data-bypass'
			}

			//console.log(data.media_embed.content)

			return data;

		},

		checkIsImg: function(url) {
			return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
		},
		fixImgur: function(url) {
			if (this.containsStr("imgur.com", url)) {
				//check if its a gallery
				if (this.containsStr("imgur.com/a", url) == true || this.containsStr("gallery", url) == true) {
					return false
				} else {
					return url + ".jpg"
				}

			}
			return false;
		},
		containsStr: function(needle, haystack) {
			return (haystack.indexOf(needle) >= 0)
		}

	});
	return Single;
});