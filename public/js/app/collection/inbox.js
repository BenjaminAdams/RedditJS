define(['backbone', "moment"], function(Backbone) {
  return Backbone.Collection.extend({
    initialize: function(nothing, data) {
      _.bindAll(this);
      this.after = ""
      this.type = data.type
      this.count = 1
      this.instanceUrl = this.getUrl()
    },
    model: Backbone.Model.extend({
      parse: function(data) {
        if (typeof data.data !== 'undefined') {
          //the data  comes in this format
          data.data.kind = data.kind
          data = data.data
        }

        data.body_html = (typeof data.body_html === 'undefined') ? '' : $('<div/>').html(data.body_html).text();

        var timeAgo = moment.unix(data.created_utc).fromNow(true) //"true" removes the "ago"
        timeAgo = timeAgo.replace("in ", ''); //why would it add the word "in"
        data.timeAgo = timeAgo
        data.timeUgly = moment.unix(data.created_utc).format()
        data.timePretty = moment.unix(data.created_utc).format("ddd MMM DD HH:mm:ss YYYY") + " UTC" //format Sun Aug 18 12:51:06 2013 UTC
        return data
      }
    }),
    url: function() {
      return this.instanceUrl //keeps a dynamic URL so we can give it a new "after"
    },
    getUrl: function() {
      //http://api.reddit.com/user/armastevs.json
      if (this.after.length < 3) {
        //return '/api/?url=message/' + this.type + ".json&after=" + this.after
        return '/api/?url=message/' + this.type + "&after=" + this.after + '&mark=true'

      } else {

        return '/api/?url=message/' + this.type + '&mark=true'
      }
    },
    parse: function(response) {
      //set the after for pagination
      if (!response || !response.data) return response

      if (!response.data.after) {
        this.after = "stop" //tells us we have finished downloading all of the possible posts in this subreddit
      }

      //reset the url to have the new after tag
      this.instanceUrl = this.getUrl()
      return response.data.children;
    }
  });
});
