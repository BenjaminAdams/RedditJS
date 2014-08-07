define(['App', 'backbone', 'model/single', "moment"], function(App, Backbone, SingleModel) {

	var SubredditCollection = Backbone.Collection.extend({

		initialize: function(models, data) {
			_.bindAll(this);

			this.countNonImg = 0 //keeps track of how many non image based posts are in the subreddit

			this.after = ""
			this.subName = data.subName
			this.sortOrder = data.sortOrder
			this.domain = data.domain
			this.forceJSONP = data.forceJSONP || false //so we force the user to download the subreddit with jsonp
			this.count = 1
			if (typeof this.sortOrder === 'undefined') {
				this.sortOrder = 'hot' //the default sort order is hot
			}
			//this.sortOrder = "/" + this.sortOrder //needs to start with a slash to be injected into the URL
			this.subID = this.subName + this.sortOrder

			//build the URL string before fetch
			if (this.subName == "front" || this.domain !== null) {
				this.subnameWithrR = ''
			} else {
				this.subnameWithrR = 'r/' + this.subName + '/'
			}

			if (this.domain !== null) {
				this.domainStr = 'domain/' + this.domain + '/'
			} else {
				this.domainStr = ''
			}

			if (typeof data.timeFrame !== "undefined" && (this.sortOrder == 'controversial' || this.sortOrder == 'top')) { //known as "t" in the reddit API
				this.timeFrame = "&t=" + data.timeFrame
			} else {
				this.timeFrame = '' //blank if not in top/contrive
			}

			if (typeof data.instanceUrl !== 'undefined') {
				//so we can override the URL to pull in 1000 posts test data
				this.instanceUrl = data.instanceUrl
			} else {
				this.instanceUrl = this.getUrl()
			}

		},
		// Reference to this collection's model.
		model: SingleModel,
		url: function() {
			return this.instanceUrl //keeps a dynamic URL so we can give it a new "after"
		},
		getUrl: function() {
			//var username = $.cookie('username')
			var username = App.user.name || false
			var linkCount = App.settings.get('linkCount')
			console.log('username=', username)
			if (username !== false && this.forceJSONP === false) {
				console.log('getting subreddit via redditjs server.....')
				return '/api/?url=' + this.domainStr + this.subnameWithrR + this.sortOrder + ".json&limit=" + linkCount + "&after=" + this.after + this.timeFrame
			} else {
				console.log('getting subreddit via JSONP')

				if (App.isBot === true) {

					return App.baseURL + this.domainStr + this.subnameWithrR + this.sortOrder + ".json?after=" + this.after + this.timeFrame + "&limit=" + linkCount
				} else {
					return 'https://reddit.com/' + this.domainStr + this.subnameWithrR + this.sortOrder + ".json?after=" + this.after + this.timeFrame + "&limit=" + linkCount + "&jsonp=?"
				}

				//return App.baseURL + this.domainStr + this.subnameWithrR + this.sortOrder + ".json?after=" + this.after + this.timeFrame + "&limit=" + linkCount + "&jsonp=?"
			}
		},
		parse: function(response) {
			var self = this;
			if (typeof response === 'undefined' || response.length === 0) {
				return
			}

			this.after = response.data.after;

			if (typeof this.after === 'undefined' || this.after === "" || this.after === null) {
				this.after = "stop" //tells us we have finished downloading all of the possible posts in this subreddit
			}

			var modhash = response.data.modhash;
			if (typeof modhash == "string" && modhash.length > 5) {
				$.cookie('modhash', modhash, {
					path: '/'
				});
			}

			var models = Array();
			_.each(response.data.children, function(item) {
				if (item.data.hidden === false) {

					var singleModel = new SingleModel({
						subName: this.subName,
						id: item.data.id,
						parseNow: false
					});
					item.data = singleModel.parseOnce(item.data)
					item.data.count = self.count

					if ((self.count % 2) === 0) {
						item.data.evenOrOdd = "even"
					} else {
						item.data.evenOrOdd = "odd"
					}

					self.count++;

					if (item.data.imgUrl === false) {
						self.countNonImg++;
					}

					models.push(item.data)

				}
			});

			//reset the url to have the new after tag
			this.instanceUrl = this.getUrl()
			return models;
		},
		//checks the subreddit to make sure it has no image posts.
		//returns true if it contains at least one image
		hasNoImages: function() {
			var nonImgs = this.where({
				imgUrl: false
			})
		}
	});
	return SubredditCollection;
});