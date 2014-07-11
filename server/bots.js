var request = require('request');

module.exports = {

	fetchForBot: function(res, req) {

		var fetchBots = ['http://redditjs-source.herokuapp.com/', 'http://redditjs-source2.herokuapp.com/']
		var bot = fetchBots[Math.floor((Math.random() * 2))]

		var options = {
			url: bot + req.path,
			//url: 'http://redditjs-source.herokuapp.com/' + req.path,
			timeout: 10000
		}
		request.get(options, function(error, response, body) {
			res.send(200, body)
		});
	}

}