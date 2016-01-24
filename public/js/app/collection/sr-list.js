define(['App', 'backbone', 'model/single'], function(App, Backbone, SingleModel) {
  return Backbone.Collection.extend({
    initialize: function() {

    },
    //model: SingleModel,
    url: '/data/TMPsubredditList.json',
    comparator: 'display_name',
    parse: function(response) {
      //TODO: Make this less of a hack....
      for (var key in response) {
        App.subreddits[key] = response[key];
      }

      return null;
    }

  });
});
