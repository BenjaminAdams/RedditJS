define(['App', 'underscore', 'backbone', 'jquery'], function(App, _, Backbone, $) {
	return Backbone.Model.extend({
		initialize: function() {},
		url: '/api/?url=api/v1/me'
		//url: '/api/?url=api/me.json'  //cant do non-oauth calls

	});
});