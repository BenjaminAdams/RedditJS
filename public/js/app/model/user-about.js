define(['underscore', 'backbone', 'jquery', 'localstorage'], function(_, Backbone, $, Localstorage) {
	var UserAbout = Backbone.Model.extend({
		initialize: function(data) {
			this.username = data
		},
		url: function() {
			//console.log("/api/?url=user/" + this.username + "/about.json")
			//return "/api/?url=user/" + this.username + "/about.json&cookie=" + $.cookie('reddit_session');
			return "/api/?url=user/" + this.username + "/about.json"
		},
		//so we have the attributes in the root of the model
		parse: function(response) {
			data = response.data

			var timeAgo = moment.unix(data.created).fromNow(true) //"true" removes the "ago"
			timeAgo = timeAgo.replace("in ", ''); //why would it add the word "in"
			data.timeAgo = timeAgo
			data.timeUgly = moment.unix(data.created).format()
			data.timePretty = moment.unix(data.created).format("ddd MMM DD HH:mm:ss YYYY") + " UTC" //format Sun Aug 18 12:51:06 2013 UTC
			if (typeof data.comment_karma !== 'undefined') {
				data.comment_karma = this.numberWithCommas(data.comment_karma) || 0
			}
			data.uglyKarma = data.link_karma
			data.link_karma = this.numberWithCommas(data.link_karma)

			return data;

		},

		numberWithCommas: function(x) {
			return x.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
		}

	});
	return UserAbout;
});