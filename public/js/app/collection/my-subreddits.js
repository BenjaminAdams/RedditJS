define(['App', 'backbone', 'model/single', 'localstorage'], function(App, Backbone, SingleModel, Localstorage) {
	var MySubreddits = Backbone.Collection.extend({
		initialize: function() {

			var srcookie = $.totalStorage('subreddits')
			if (typeof $.totalStorage('subreddits') !== 'undefined' && $.totalStorage('subreddits') !== null) {

				this.loadFromCookie()

			} else {

				this.fetch()
			}

			//this.fetch()

		},
		model: SingleModel,
		url: function() {
			if (typeof $.cookie('username') !== 'undefined') {
				return "/api/?url=reddits/mine.json&limit=100&cookie=" + $.cookie('reddit_session');
			} else {
				return "/api/?url=subreddits.json"
				//return 'http://api.reddit.com/subreddits.json&jsonp=?'
			}
		},
		//so we have the attributes in the root of the model
		parse: function(response) {
			var subreddits = []
			//var subredditsStr = ""

			if (typeof response === 'undefined' || response.data === 'undefined') {
				this.loadDefaultSubreddits()
			} else {

				_.each(response.data.children, function(item) {
					var sub = new SingleModel({
						header_img: item.data.header_img,
						display_name: item.data.display_name

					})
					subreddits.push(sub)

				})

				$.totalStorage('subreddits', subreddits);

				return subreddits;
			}

		},
		loadFromCookie: function() {
			var self = this
			var subreddits = $.totalStorage('subreddits')
			for (var i = 0; i < subreddits.length; i++) {
				self.add({
					display_name: subreddits[i].display_name,
					header_img: subreddits[i].header_img

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

			App.subreddits.mine = this

		}

	});
	return MySubreddits;
});