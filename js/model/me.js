define(['underscore', 'backbone', 'jquery'], function(_, Backbone, $) {
	var Me = Backbone.Model.extend({
		initialize: function(data) {
			this.subName = data
		},

		url: function() {

			return "/api/?url=api/me.json&cookie=" + $.cookie('reddit_session');
		},

		// Default attributes 
		defaults: {
			// name: "Beer name",
			// image:"some img",
			//  slug: "slug"
		},
		//so we have the attributes in the root of the model
		parse: function(response) {
			data = response.data

			return data;

		},

	});
	return Me;
});