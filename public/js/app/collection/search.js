define(['App', 'backbone', 'model/single', "moment"], function(App, Backbone, SingleModel) {
	return Backbone.Collection.extend({
		initialize: function(x, data) {
			_.bindAll(this);
			this.after = ""
			this.subNameStr = ''
			this.restrict_sr = false
			this.field_name = 'text'
			this.subName = data.subName

			this.sortOrder = data.sortOrder
			this.searchQ = data.searchQ.replace(/\s/g, '+').toLowerCase();

			if (typeof this.sortOrder === 'undefined') {
				this.sortOrder = 'hot' //the default sort order is hot
			}

			this.timeFrame = data.timeFrame
			if (typeof this.timeFrame === 'undefined') {
				this.timeFrame = 'month' //the default sort order is hot
			}

			if (typeof this.subName !== 'undefined') {
				//actions for when the user is using search for finding similar titles
				this.subNameStr = 'r/' + this.subName + '/' //the default sort order is hot
				this.restrict_sr = true
				this.searchQ = "title:" + this.searchQ
			}

			this.count = 1
			this.instanceUrl = this.getUrl()

		},
		model: SingleModel,
		url: function() {
			return this.instanceUrl //keeps a dynamic URL so we can give it a new "after"
		},
		getUrl: function() {
			//this works http://www.reddit.com/search.json?q=test&after=t3_18irx&sort=hot&t=week
			return App.baseURL + this.subNameStr + 'search.json?q=' + this.searchQ + '&after=' + this.after + "&sort=" + this.sortOrder + '&t=' + this.timeFrame + "&restrict_sr=" + this.restrict_sr + "&limit=100&jsonp=?"

			//jsonp search? 
			//http://www.reddit.com/search.json?q=test&after=t3_18irx&sort=hot&t=week&jsonp=?

		},
		parse: function(response) {
			//set the after for pagination
			console.log(response)
			this.after = response.data.after;

			if (this.after === "" || this.after === null) {
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

					models.push(item.data)
				}
			});

			//reset the url to have the new after tag
			this.instanceUrl = this.getUrl()
			return models;
		}

	});
});