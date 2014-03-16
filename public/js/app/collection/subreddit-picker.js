define(['App', 'backbone', "moment"], function(App, Backbone) {

	return Backbone.Collection.extend({
		initialize: function(data) {
			_.bindAll(this);
			this.after = ""
			this.searchQ = data.searchQ
			this.count = 1
			this.instanceUrl = this.getUrl()
		},
		url: function() {
			return this.instanceUrl //keeps a dynamic URL so we can give it a new "after"
		},
		getUrl: function() {
			if (typeof this.searchQ === 'undefined' || this.searchQ === '') {
				return 'http://www.reddit.com/subreddits.json?after=' + this.after + "&jsonp=?"
			} else {
				//http://www.reddit.com/subreddits/search.json?q=test

				return 'http://www.reddit.com/subreddits/search.json?q=' + this.searchQ + '&after=' + this.after + "&jsonp=?"
			}
		},
		parse: function(response) {
			//set the after for pagination
			this.after = response.data.after;
			var self = this
			if (this.after === "" || this.after === null) {
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

				var timeAgo = moment.unix(item.data.created).fromNow(true) //"true" removes the "ago"
				timeAgo = timeAgo.replace("in ", ''); //why would it add the word "in"
				item.data.timeAgo = timeAgo
				item.data.timeUgly = moment.unix(item.data.created).format()
				item.data.timePretty = moment.unix(item.data.created).format("ddd MMM DD HH:mm:ss YYYY") + " UTC" //format Sun Aug 18 12:51:06 2013 UTC
				item.data.rname = "/r/" + item.data.display_name
				//item.data.accounts_active = self.numberWithCommas(item.data.accounts_active)
				item.data.subscribers = self.numberWithCommas(item.data.subscribers)
				//data.description = markdown.toHTML(data.description)
				//item.data.description_html = (typeof item.data.description_html === 'undefined') ? '' : $('<div/>').html(item.data.description_html).text();

				var findInUsrSubs = App.subreddits.mine.findWhere({
					display_name: item.data.display_name
				})
				if (typeof findInUsrSubs === 'undefined') {
					item.data.likes = false

					item.data.user_is_subscriber = false
				} else {
					item.data.likes = true
					item.data.user_is_subscriber = true
				}

				models.push(item.data)

			});

			//reset the url to have the new after tag
			this.instanceUrl = this.getUrl()
			return models;
		},
		numberWithCommas: function(x) {
			return x.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
		}

	});

});