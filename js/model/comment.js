define(['underscore', 'backbone', 'jquery', 'model/base'], function(_, Backbone, $, BaseModel) {
	var Comment = BaseModel.extend({
		// initialize: function() {

		// },

		url: function() {
			//http://www.reddit.com/dev/api#POST_api_morechildren
			///api/morechildren
			return "/api/?url=comments/1kvsi9.json&cookie=" + $.cookie('reddit_session');
		},

		// Default attributes 
		// defaults: {
		// 	display_name: '',
		// 	description_html: '',

		// },

		//so we have the attributes in the root of the model
		// parse: function(response) {
		// 	data = response.data

		// 	return data;

		// },

	});
	return Comment;
});