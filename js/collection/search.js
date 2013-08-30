define(['backbone', 'model/single', "moment"], function(Backbone, SingleModel) {

	var SearchCollection = Backbone.Collection.extend({
		initialize: function(data) {
			_.bindAll(this);
			this.after = ""
			this.sortOrder = data.sortOrder
			this.searchQ = data.searchQ
			if (typeof this.sortOrder === 'undefined') {
				this.sortOrder = 'hot' //the default sort order is hot
			};

			this.timeFrame = data.timeFrame

			this.count = 1
			this.instanceUrl = this.getUrl()

		},
		model: SingleModel,
		url: function() {

			return this.instanceUrl //keeps a dynamic URL so we can give it a new "after"

		},

		getUrl: function() {
			//this works http://www.reddit.com/search.json?q=test&after=t3_18irx&sort=hot&t=week
			//console.log('/api/?url=search.json&t=' + this.timeFrame + '&syntax=plain&after=' + this.after + "&sort=" + this.sortOrder + '&q=' + this.searchQ)
			return 'http://www.reddit.com/search.json?q=' + this.searchQ + '&after=' + this.after + "&sort=" + this.sortOrder + '&t=' + this.timeFrame + "&jsonp=?"
			//return '/api/?url=search.json?q=' + this.searchQ + '&after=' + this.after + "&sort=" + this.sortOrder + '&t=' + this.timeFrame
			// return '/api/?url=search.json?q=' + this.searchQ + '&t=' + this.timeFrame + '&syntax=plain&after=' + this.after + "&sort=" + this.sortOrder + "&cookie=" + $.cookie('reddit_session');

			//jsonp search? 
			//http://www.reddit.com/search.json?q=test&after=t3_18irx&sort=hot&t=week&jsonp=?

		},
		parse: function(response) {
			//set the after for pagination
			console.log(response)
			this.after = response.data.after;

			if (this.after == "" || this.after == null) {
				this.after = "stop" //tells us we have finished downloading all of the possible posts in this subreddit
			}

			var modhash = response.data.modhash;
			if (typeof modhash == "string" && modhash.length > 5) {
				$.cookie('modhash', modhash, {
					path: '/'
				});
			}

			var self = this;
			var models = Array();
			_.each(response.data.children, function(item) {
				if (item.data.hidden == false) {

					var singleModel = new SingleModel({
						subName: this.subName,
						id: item.data.id,
						parseNow: false
					});
					item.data = singleModel.parseOnce(item.data)
					item.data.count = self.count

					if ((self.count % 2) == 0) {
						item.data.evenOrOdd = "even"
					} else {
						item.data.evenOrOdd = "odd"
					}

					self.count++;

					models.push(item.data)
				}
			});

			//reset the url to have the new after tag
			this.instanceUrl = this.getUrl()
			return models;
		},

	});
	return SearchCollection;
});