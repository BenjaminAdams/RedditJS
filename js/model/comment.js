define(['underscore', 'backbone', 'jquery'], function(_, Backbone, $) {
	var Comment = Backbone.Model.extend({
		initialize: function(data) {

		},

		url: function() {
			return return "/api/?url=comments/1kvsi9.json&cookie=" + $.cookie('reddit_session');
		},

		// Default attributes 
		// defaults: {
		// 	display_name: '',
		// 	description_html: '',

		// },
		//so we have the attributes in the root of the model
		parse: function(response) {
			data = response.data
			var timeAgo = moment.unix(data.created).fromNow(true) //"true" removes the "ago"
			timeAgo = timeAgo.replace("in ", ''); //why would it add the word "in"
			data.timeAgo = timeAgo
			data.timeUgly = moment.unix(data.created).format()
			data.timePretty = moment.unix(data.created).format("ddd MMM DD HH:mm:ss YYYY") + " UTC" //format Sun Aug 18 12:51:06 2013 UTC
			data.rname = "/r/" + data.display_name
			//data.description = markdown.toHTML(data.description)
			data.description_html = (typeof data.selftext_html === 'undefined') ? '' : $('<div/>').html(data.selftext_html).text();
			//data.description_html = data.description_html.replace("reddit.com","redditjs.com")
			//localStorage[this.subName] = JSON.stringify(data)
			return data;

		},

	});
	return Comment;
});