define(['backbone', 'model/single'], function(Backbone, SingleModel) {
	var MySubreddits = Backbone.Collection.extend({
		initialize: function() {

			if (typeof $.cookie('username') !== 'undefined') {

				if (typeof $.cookie('subreddits') !== 'undefined') {

					if ($.cookie('subreddits').length < 15) {
						this.fetch()
					} else {
						this.loadFromCookie()
					}
				} else {

					this.fetch()
				}

			} else {
				this.loadDefaultSubreddits()
			}

		},
		model: SingleModel,
		url: function() {
			return "/api/?url=reddits/mine.json&limit=100&cookie=" + $.cookie('reddit_session');
		},
		//so we have the attributes in the root of the model
		parse: function(response) {
			var subreddits = []
			var subredditsStr = ""

			if (typeof response === 'undefined' || response.data === 'undefined') {
				this.loadDefaultSubreddits()
			} else {

				_.each(response.data.children, function(item) {
					var sub = new SingleModel(item.data)
					subreddits.push(sub)
					subredditsStr += item.data.display_name + ","
				})
				$.cookie('subreddits', subredditsStr, {
					expires: 7
				})
				return subreddits;
			}

		},
		loadFromCookie: function() {
			var self = this
			var subreddits = $.cookie('subreddits').split(",")
			for (var i = 0; i < subreddits.length; i++) {
				self.add({
					display_name: subreddits[i]
				});
			}
		},
		loadDefaultSubreddits: function() {

			this.add({
				display_name: "funny"
			});
			this.add({
				display_name: "pics"
			});

			this.add({
				display_name: "aww"
			});
			this.add({
				display_name: "WTF"
			});
			this.add({
				display_name: "gifs"
			});
			this.add({
				display_name: "AdviceAnimals"
			});

			this.add({
				display_name: "EarthPorn"
			});
			this.add({
				display_name: "AskReddit"
			});
			this.add({
				display_name: "explainlikeimfive"
			});
			this.add({
				display_name: "gaming"
			});
			this.add({
				display_name: "bestof"
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
				display_name: "books"
			});
			this.add({
				display_name: "videos"
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
				display_name: "askscience"
			});

			this.add({
				display_name: "worldnews"
			});
			this.add({
				display_name: "blog"
			});

			window.subreddits = this

		}

	});
	return MySubreddits;
});