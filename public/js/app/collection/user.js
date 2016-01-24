define(['App', 'backbone', 'model/single', 'model/comment'], function(App, Backbone, SingleModel, CommentModel) {
  return Backbone.Collection.extend({
    initialize: function(tmp, data) {
      _.bindAll(this);
      this.after = ""
      this.username = data.username
      this.sortOrder = data.sortOrder
      if (typeof this.sortOrder === 'undefined' || this.sortOrder === 'reqAsBot=1') {
        this.sortOrder = 'new' //the default sort order is hot
      }

      this.count = 1
      this.instanceUrl = this.getUrl()

    },

    model: Backbone.Model.extend(),

    url: function() {
      return this.instanceUrl //keeps a dynamic URL so we can give it a new "after"
    },
    getUrl: function() {
      //http://api.reddit.com/user/armastevs.json
      var urlPrefix = this.getUrlPrefix()

      if (this.after.length < 3) {
        return urlPrefix + this.username + ".json&sort=" + this.sortOrder
      } else {
        return urlPrefix + this.username + ".json&after=" + this.after + "&sort=" + this.sortOrder
      }
    },
    getUrlPrefix: function() {
      //if the user is logged in fetch via server
      //we have to do this because there is a problem getting user data from the reddit api
      var username = App.user.name || false
      if (username !== false) {
        return '/api/?url=user/'
      }
      return '/apiNonAuth/?url=user/'
    },
    parse: function(response) {

      var self = this;
      this.after = response.data.after; //set the after for pagination

      if (this.after === "" || this.after === null) {
        this.after = "stop" //tells us we have finished downloading all of the possible posts in this subreddit
      }

      var modhash = response.data.modhash;
      if (typeof modhash == "string" && modhash.length > 5) {
        $.cookie('modhash', modhash, {
          path: '/'
        });
      }

      var models = [];

      //build the children array of the users posts into the main collection
      _.each(response.data.children, function(item, count) {

        if ((count % 2) === 0) {
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

        if (item.data.kind === 't1') {
          //parse this is a comment
          var comment = new CommentModel(item.data, {
            parse: true
          })
          models.push(comment.attributes)

        } else if (item.data.kind === 't3') {
          //parse this is a reddit post
          var post = new SingleModel(item.data, {
            parse: true
          })
          models.push(post.attributes)
        } else {
          console.log('not sure what to do')
        }

      });
      this.instanceUrl = this.getUrl()
      return models;
    }

  });

});
