define(['backbone', 'model/single', 'model/comment', "moment"], function(Backbone, SingleModel, CommentModel) {

	var User = Backbone.Collection.extend({
		initialize: function(data) {
			_.bindAll(this);
			this.after = ""
			this.subName = data.subName
			this.sortOrder = data.sortOrder
			if (typeof this.sortOrder === 'undefined') {
				this.sortOrder = 'new' //the default sort order is hot
			}

			this.count = 1
			this.instanceUrl = this.getUrl()

		},
		// Reference to this collection's model.
		model: SingleModel,

		url: function() {
			return this.instanceUrl //keeps a dynamic URL so we can give it a new "after"
		},
		getUrl: function() {
			//http://api.reddit.com/user/armastevs.json
			return '/api/?url=user/' + this.subName + ".json?after=" + this.after + "&sort=" + this.sortOrder + "&cookie=" + $.cookie('reddit_session');
		},
		parse: function(response) {
			//set the after for pagination
			this.after = response.data.after;
			console.log('response=', response)

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

				if ((self.count % 2) == 0) {
					item.data.evenOrOdd = "even"
				} else {
					item.data.evenOrOdd = "odd"
				}

				if (item.kind == "t1") {

					//URL is not set in user json feed, set it now
					//http://www.reddit.com/r/gifs/comments/1l6mfy/bullet_through_water_bottle/
					item.data.url = '/r/' + item.data.subreddit + '/comments/' + item.data.id
					item.data.is_self = true
					item.data.media_embed = ''
					item.data.kind = item.kind
					item.data.title = item.data.link_title
					var single = new SingleModel({
						subName: this.subName,
						id: item.data.id,
						parseNow: true
					});

					item.data = single.parseOnce(item.data)
					models.push(item.data)
					//item.data.count = self.count
				} else if (item.kind == 't3') {
					item.data.link_id = item.data.id
					item.data.kind = item.kind
					var comment = new CommentModel(item.data)

					models.push(comment.attributes)
				}

				self.count++;

			});

			//reset the url to have the new after tag
			this.instanceUrl = this.getUrl()
			console.log('returning models=', models)
			return models;
		},

	});
	return User;
});