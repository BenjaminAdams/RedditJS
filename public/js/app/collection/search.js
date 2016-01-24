define(['App', 'backbone', 'model/single', 'collection/subreddit'], function(App, Backbone, SingleModel, SrCollection) {
  return SrCollection.extend({
    initialize: function(x, data) {
      _.bindAll(this);
      this.after = ""
      this.subNameStr = ''
      this.restrict_sr = false
      this.field_name = 'text'
      this.subName = data.subName

      this.sortOrder = data.sortOrder
      this.searchQ = data.searchQ.replace(/\s/g, '+').toLowerCase();

      if (typeof this.sortOrder === 'undefined' || this.sortOrder === 'reqAsBot=1') {
        this.sortOrder = 'hot' //the default sort order is hot
      }

      this.timeFrame = data.timeFrame
      if (typeof this.timeFrame === 'undefined') {
        this.timeFrame = 'month' //the default sort order is hot
      }

      if (typeof this.subName !== 'undefined') {
        //actions for when the user is using search for finding similar titles
        this.subNameStr = 'r/' + this.subName + '/' //the default sort order is hot
        this.restrict_sr = true
        this.searchQ = "title:" + this.searchQ
      }

      this.count = 1
      this.instanceUrl = this.getUrl()

    },
    model: SingleModel,
    url: function() {
      return this.instanceUrl //keeps a dynamic URL so we can give it a new "after"
    },
    getUrl: function() {
      //this works http://www.reddit.com/search.json?q=test&after=t3_18irx&sort=hot&t=week
      return App.baseURL + this.subNameStr + 'search.json?q=' + this.searchQ + '&after=' + this.after + "&sort=" + this.sortOrder + '&t=' + this.timeFrame + "&restrict_sr=" + this.restrict_sr + "&limit=100&jsonp=?"

      //jsonp search? 
      //http://www.reddit.com/search.json?q=test&after=t3_18irx&sort=hot&t=week&jsonp=?

    }

  });
});
