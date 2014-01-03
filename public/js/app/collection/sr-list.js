define(['App', 'backbone', 'model/single'], function(App, Backbone, SingleModel) {
	return Backbone.Collection.extend({
		initialize: function() {

		},
		//model: SingleModel,
		//url: '/data/subredditList.json',
		//url: '/getSrList',
		url: '/data/TMPsubredditList.json',
		parse: function(response) {
			//TODO: Make this less of a hack....
			for (var key in response) {
				App.subreddits[key] = response[key];
			}

			return null;
		}

	});
});