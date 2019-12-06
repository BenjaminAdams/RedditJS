define(['App', 'underscore', 'backbone', 'jquery'], function(App, _, Backbone, $) {
	return Backbone.Model.extend({
		initialize: function(models, username) {
			//this.username = data
			this.username = username
		},
		url: function() {
			var urlPrefix = '/apiNonAuth/?url=user/'
			var username = App.user.name || false

			if (username !== false) {
				urlPrefix = '/api/?url=user/'
			}

			return urlPrefix + this.username + "/about.json"
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
});