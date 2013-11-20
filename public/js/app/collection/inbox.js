/* Inbox.js Collection

View mail in these formats:
unread
sent
all


*/

define(['backbone', 'model/single', 'model/comment', "moment"], function(Backbone, SingleModel, CommentModel) {

	var User = Backbone.Collection.extend({
		initialize: function(nothing, data) {
			_.bindAll(this);
			this.after = ""
			this.type = data.type

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
				return '/api/?url=message/' + this.type + ".json&after=" + this.after + "&cookie=" + $.cookie('reddit_session');

			} else {

				return '/api/?url=message/' + this.type + ".json&cookie=" + $.cookie('reddit_session');
			}
		},

		/*              example detail:
	// body: asdasdasdasdasd
	// was_comment: false
	// first_message: null
	// name: t4_13g95s
	// first_message_name: null
	// created: 1378417702
	// dest: armastevs
	// author: faketestuser
	// created_utc: 1378388902
	// body_html: <!-- SC_OFF --><div class="md"><p>asdasdasdasdasd</p> </div><!-- SC_ON -->
	// subreddit: null
	// parent_id: null
	// context:
	// replies:
	// new: true   //if the message is unread or not
	// id: 13g95s
	//subject: asdasdasd
	*/
		parse: function(response) {
			//set the after for pagination
			this.after = response.data.after;
			console.log('response=', response)

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

				if ((self.count % 2) === 0) {
					item.data.evenOrOdd = "even"
				} else {
					item.data.evenOrOdd = "odd"
				}

				item.data.body_html = (typeof item.data.body_html === 'undefined') ? '' : $('<div/>').html(item.data.body_html).text();

				var timeAgo = moment.unix(item.data.created).fromNow(true) //"true" removes the "ago"
				timeAgo = timeAgo.replace("in ", ''); //why would it add the word "in"
				item.data.timeAgo = timeAgo
				item.data.timeUgly = moment.unix(item.data.created).format()
				item.data.timePretty = moment.unix(item.data.created).format("ddd MMM DD HH:mm:ss YYYY") + " UTC" //format Sun Aug 18 12:51:06 2013 UTC

				models.push(item.data)

			});

			//reset the url to have the new after tag
			this.instanceUrl = this.getUrl()
			console.log('returning models=', models)
			return models;
		}

	});
	return User;
});