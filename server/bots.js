var request = require('request');

module.exports = {

	fetchForBot: function(res, req) {
		var options = {
			url: 'http://redditjs-source.herokuapp.com/' + req.path,
			//url: 'http://localhost:8005/' + req.path,
			timeout: 10000
		}

		request.get(options, function(error, response, body) {

			res.send(200, body)

		});
	}

}