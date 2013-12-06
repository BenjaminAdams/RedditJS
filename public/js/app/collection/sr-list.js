define(['backbone', 'model/single'], function(Backbone, SingleModel) {
	return Backbone.Collection.extend({
		initialize: function() {

		},
		//model: SingleModel,
		url: '/data/subredditList.json',
		parse: function(response) {
			//window.subreddits.concat(response);
			_.merge(window.subreddits, response);
			//TODO: Make this less of a hack....
			//_.each(response, function(item, i, test) {
			//})
			return null;
		}

	});
});