define(['underscore', 'backbone', 'collection/comments'], function(_, Backbone, CommentsCollection) {
	var Single = Backbone.Model.extend({
		initialize: function(data) {
			this.id = data.id

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
		//so we have the attributes in the root of the model
		parse: function(response) {
			var data;
			if (typeof response[0] === 'undefined') {
				data = response
			} else {

				data = response[0].data.children[0].data
				console.log('single model in comment parse', response[1].data.children)
				data.replies = new CommentsCollection({
					children: response[1].data.children,
					link_id: data.name
				}) //transform the replies into a comment collection
				//data.comments = response[1].data.children

			}

			var timeAgo = moment.unix(data.created).fromNow(true) //"true" removes the "ago"
			timeAgo = timeAgo.replace("in ", ''); //why would it add the word "in"
			data.timeAgo = timeAgo
			data.timeUgly = moment.unix(data.created).format()
			data.timePretty = moment.unix(data.created).format("ddd MMM DD HH:mm:ss YYYY") + " UTC" //format Sun Aug 18 12:51:06 2013 UTC
			data.rname = "/r/" + data.display_name
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

			if (typeof data.media_embed.content === 'undefined' && data.is_self == false && data.imgUrl != false) {
				data.media_embed = new Array()
				data.media_embed.content = "<div class='embed'><p><a data-bypass  href='" + data.url + "' target='_blank'> <img src='" + data.imgUrl + "' /> </a></p></div>"

			} else if (data.media_embed.content = (typeof data.media_embed.content === 'undefined')) {
				//if it has embed content, lets embed it
				data.media_embed.content = $('<div/>').html(data.media_embed.content).text();
				data.media_embed.content = "<div class='embed'><p><a data-bypass  href='" + data.url + "' target='_blank'> <img src='" + data.imgUrl + "' /> </a></p></div>"

			} else {
				data.media_embed.content = ""
			}

			if (data.is_self == false) {
				data.external = 'data-bypass'
			}

			return data;

		},

		// decodeHTMLEntities: function(str) {
		// 	var element = document.createElement('div');
		// 	if (str && typeof str === 'string') {
		// 		// strip script/html tags
		// 		str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
		// 		str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
		// 		element.innerHTML = str;
		// 		str = element.textContent;
		// 		element.textContent = '';
		// 	}

		// 	return str;
		// },
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