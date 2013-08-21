define(['underscore', 'backbone', 'jquery'], function(_, Backbone, $) {
	var MySubreddits = Backbone.Collection.extend({
		initialize: function(data) {
			this.subName = data
		},

		url: function() {

			return "/api/?url=reddits/mine.json?limit=100&cookie=" + $.cookie('reddit_session');

		},

		//so we have the attributes in the root of the model
		parse: function(response) {
			var subreddits = new Array();
			console.log("data in parse=", data)

			_.each(response.data.children, function(item) {
				console.log(item)
				subreddits.push()

			})
			return subreddits;

		},

	});
	return MySubreddits;
});