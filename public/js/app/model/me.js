define(['App', 'underscore', 'backbone', 'jquery'], function(App, _, Backbone, $) {
	return Backbone.Model.extend({
		initialize: function() {},
		url: '/api/?url=/api/v1/me'
	});
});