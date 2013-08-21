define(['backbone', 'model/post'], function(Backbone, PostModel) {
	var MySubreddits = Backbone.Collection.extend({
		initialize: function() {

		},
		model: PostModel,
		url: function() {

			return "/api/?url=reddits/mine.json?limit=100&cookie=" + $.cookie('reddit_session');

		},

		//so we have the attributes in the root of the model
		parse: function(response) {
			var subreddits = new Array();

			_.each(response.data.children, function(item) {
				//console.log(item.data)
				var sub = new PostModel(item.data)
				//	console.log(sub.attributes)
				subreddits.push(sub)
				//console.log(item.data)
				//subreddits.push(item.data)

			})
			return subreddits;

		},
		loadDefaultSubreddits: function() {

			this.add({
				display_name: "AdviceAnimals"
			});
			this.add({
				display_name: "announcements"
			});
			this.add({
				display_name: "AskReddit"
			});
			this.add({
				display_name: "askscience"
			});
			this.add({
				display_name: "aww"
			});
			this.add({
				display_name: "bestof"
			});
			this.add({
				display_name: "blog"
			});
			this.add({
				display_name: "books"
			});
			this.add({
				display_name: "EarthPorn"
			});
			this.add({
				display_name: "explainlikeimfive"
			});

			this.add({
				display_name: "gaming"
			});
			this.add({
				display_name: "gifs"
			});
			this.add({
				display_name: "IAmA"
			});
			this.add({
				display_name: "movies"
			});
			this.add({
				display_name: "Music"
			});
			this.add({
				display_name: "news"
			});
			this.add({
				display_name: "science"
			});
			this.add({
				display_name: "technology"
			});
			this.add({
				display_name: "television"
			});
			this.add({
				display_name: "todayilearned"
			});
			this.add({
				display_name: "videos"
			});
			this.add({
				display_name: "worldnews"
			});
			this.add({
				display_name: "WTF"
			});

		}

	});
	return MySubreddits;
});