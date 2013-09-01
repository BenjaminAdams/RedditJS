define(['backbone', 'model/single', "moment"], function(Backbone, SingleModel) {

	var SubredditCollection = Backbone.Collection.extend({
		initialize: function(data) {
			_.bindAll(this);
			this.after = ""
			this.subName = data.subName
			this.sortOrder = data.sortOrder
			if (typeof this.sortOrder === 'undefined') {
				this.sortOrder = 'hot' //the default sort order is hot
			};
			//this.sortOrder = "/" + this.sortOrder //needs to start with a slash to be injected into the URL

			console.log('sort order=', this.sortOrder)
			this.count = 1
			this.instanceUrl = this.getUrl()

		},
		// Reference to this collection's model.
		model: SingleModel,

		url: function() {

			return this.instanceUrl //keeps a dynamic URL so we can give it a new "after"
		},

		getUrl: function() {

			var username = $.cookie('username')
			if (typeof username !== "undefined") {
				if (this.subName == "front") {
					return "/api/?url=" + this.sortOrder + ".json?after=" + this.after + "&cookie=" + $.cookie('reddit_session');
				} else {

					return '/api/?url=r/' + this.subName + "/" + this.sortOrder + ".json?after=" + this.after + "&sort=" + this.sortOrder + "&cookie=" + $.cookie('reddit_session');
				}
			} else {
				//if user is NOT logged in, use jsonp request
				if (this.subName == "front") {

					return "http://api.reddit.com/" + this.sortOrder + ".json?after=" + this.after + "&jsonp=?"
				} else {
					return "http://api.reddit.com/r/" + this.subName + "/" + this.sortOrder + ".json?after=" + this.after + "&jsonp=?"
					//return '/api/?url=r/' + this.subName + this.sortOrder + ".json?after=" + this.after + "&sort=" + this.sortOrder + "&cookie=" + $.cookie('reddit_session');
				}
			}

		},

		parse: function(response) {
			//set the after for pagination
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
	return SubredditCollection;
});