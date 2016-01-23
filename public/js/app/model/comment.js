define(['App', 'underscore', 'backbone', 'jquery', 'model/parseComments'], function(App, _, Backbone, $, parseComments) {
  return Backbone.Model.extend({
    initialize: function(options) {
      if (typeof options.skipParse === 'undefined') {
        this.parseThis()
      }
    },
    parseThis: function() {
      var data = this.attributes

      var timeAgo = moment.unix(data.created_utc).fromNow(true) //"true" removes the "ago"
      timeAgo = timeAgo.replace("in ", ''); //why would it add the word "in"
      data.timeAgo = timeAgo
      data.timeUgly = moment.unix(data.created_utc).format()
      data.timePretty = moment.unix(data.created_utc).format("ddd MMM DD HH:mm:ss YYYY") + " UTC" //format Sun Aug 18 12:51:06 2013 UTC

      //if the comment is edited format its last edited time
      if (typeof data.edited !== 'undefined' && data.edited !== false) {
        timeAgo = moment.unix(data.edited).fromNow(true) //"true" removes the "ago"
        timeAgo = timeAgo.replace("in ", ''); //why would it add the word "in"
        data.editedTimeAgo = timeAgo
      }

      data.score = +data.ups - parseInt(data.downs, 10)
      data.scoreUp = +data.score + 1
      data.scoreDown = +data.score - 1

      data.kind = "t1" //either "more" or "t1"

      if (data.likes === null) {
        data.voted = 'unvoted'
        data.downmod = 'down'
        data.upmod = 'up'
      } else if (data.likes === true) {
        data.voted = "likes"
        data.downmod = 'down'
        data.upmod = 'upmod'
      } else {
        data.voted = "dislikes"
        data.downmod = 'downmod'
        data.upmod = 'up'
      }

      //for the user view we can have comments
      if (typeof data.thumbnail !== 'undefined' && data.thumbnail == 'self') {
        data.thumbnail = 'img/self.png'
      } else if (data.thumbnail == 'nsfw') {
        data.thumbnail = 'img/nsfw.png'
      } else if (data.thumbnail === '' || data.thumbnail == 'default') {
        data.thumbnail = 'img/notsure.png'
      }

      data.body_html = (typeof data.body_html === 'undefined') ? '' : $('<div/>').html(data.body_html).text();
      var linkName = data.link_id.replace('t3_', '')
      data.permalink = '/r/' + data.subreddit + '/comments/' + linkName + "/L/" + data.id

      if (typeof data.replies !== "undefined" && data.replies !== null && typeof data.replies.data !== "undefined") {

        data.replies = parseComments(data.replies.data, data.link_id)
        data.childrenCount = data.replies.length

        if (data.replies.length == 1) {
          data.childOrChildren = 'child'
        } else {
          data.childOrChildren = 'children'
        }

      } else {
        data.childOrChildren = 'children'
        data.childrenCount = 0
      }

      this.attributes = data
    }

  });

});
