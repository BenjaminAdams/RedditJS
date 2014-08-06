var request = require('request');

module.exports = {

	fetchForBot: function(res, req) {

		var fetchBots = ['http://robot85.herokuapp.com/', 'http://robot86.herokuapp.com/', 'http://robot87.herokuapp.com/']
		var bot = fetchBots[Math.floor((Math.random() * fetchBots.length))]

		var options = {
			url: bot + req.path,
			timeout: 10000
		}
		request.get(options, function(error, response, body) {
			res.send(200, body)
		});
	}

}