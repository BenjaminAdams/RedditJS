define(['backbone', 'model/single', "moment"], function(Backbone, SingleModel) {

	return Backbone.Collection.extend({
		initialize: function(x, data) {
			_.bindAll(this);
			this.subNameStr = ''
			this.linkUrl = data.linkUrl
			this.count = 1
			this.instanceUrl = this.getUrl()

		},
		model: SingleModel,
		url: function() {
			return this.instanceUrl //keeps a dynamic URL so we can give it a new "after"
		},
		getUrl: function() {
			//https://pay.reddit.com/api/info.json?url=' + linkUrl + '&r=funny
			return 'https://pay.reddit.com/api/info.json?url=' + this.linkUrl + "&limit=100"

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