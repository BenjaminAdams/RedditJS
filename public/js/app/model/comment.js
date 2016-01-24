define(['App', 'underscore', 'backbone', 'jquery'], function(App, _, Backbone, $) {
  return Backbone.Model.extend({
    parseAsCommentMoreLink: function(data) {
      if (data.children.length === 0) return null

      data.childrenCount = data.children.length

      if (data.childrenCount == 1) {
        data.replyVerb = 'reply'
      } else {
        data.replyVerb = 'replies'
      }

      return data
    },
    parse: function(data) {
      if (!data) {
        return
      }

      if (typeof data.data !== 'undefined') {
        //the data from getmorechildren comes in this format
        data.data.kind = data.kind
        data = data.data
      }

      if (data.kind === 'more') {
        return this.parseAsCommentMoreLink(data)
      }

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

        // data.replies = parseComments(data.replies.data, data.link_id)
        data.childrenCount = data.replies.data.length

        if (data.replies.length == 1) {
          data.childOrChildren = 'child'
        } else {
          data.childOrChildren = 'children'
        }

      } else {
        data.childOrChildren = 'children'
        data.childrenCount = 0
      }

      return data
    }

  });

});
