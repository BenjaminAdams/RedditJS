define(['App', 'backbone', 'model/single', "collection/subreddit"], function(App, Backbone, SingleModel, SrCollection) {
  return SrCollection.extend({
    initialize: function(models, data) {
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
      return App.baseURL + 'api/info.json?url=' + this.linkUrl + "&limit=100&jsonp=?"
    },
  });
});
