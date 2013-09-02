define(['backbone', 'model/single', 'model/comment', "moment"], function(Backbone, SingleModel, CommentModel) {

	var User = Backbone.Collection.extend({
		initialize: function(data) {
			_.bindAll(this);
			this.after = ""
			this.username = data.username
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
			if (this.after.length < 3) {
				console.log('/api/?url=user/' + this.username + ".json?sort=" + this.sortOrder + "&cookie=" + $.cookie('reddit_session'))
				return '/api/?url=user/' + this.username + ".json?sort=" + this.sortOrder + "&cookie=" + $.cookie('reddit_session');
			} else {
				return '/api/?url=user/' + this.username + ".json?after=" + this.after + "&sort=" + this.sortOrder + "&cookie=" + $.cookie('reddit_session');
			}
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

				item.data.link_id = item.data.link_id || item.data.name
				item.data.url = '/r/' + item.data.subreddit + '/comments/' + item.data.id
				item.data.is_self = true
				item.data.media_embed = ''
				item.data.kind = item.kind

				item.data.is_user = true

				//for user posts we want the title to be the body html
				if (typeof item.data.title === 'string') {
					//do nothing
				} else {
					item.data.title = item.data.link_title
				}
				//item.data.likes = item.data.likes || false

				var comment = new CommentModel(item.data)
				models.push(comment.attributes)

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