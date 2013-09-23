var fs = require("fs");
var request = require('request');

module.exports = {

	get: function(res, req) {

		var url = require('url');
		var url_parts = url.parse(req.url, true);
		var urlStr = url_parts.query.url
		var cookie = url_parts.query.cookie
		var queryParams = url_parts.path.replace('/api/?url=', '');
		queryParams = queryParams.replace(urlStr, '')

		delete queryParams.url;
		queryParams = this.ltrim(queryParams, '&');

		urlStr = 'http://api.reddit.com/' + urlStr + '?' + queryParams.toString();

		var options = {
			url: urlStr,
			headers: {
				Cookie: 'reddit_session=' + cookie,

			},
			form: url_parts.query,
		};

		request.get(options, function(error, response, body) {
			if (error) {
				console.log('error in get=', error)
				res.json({
					code: '404'
				})
			}

			if (!error && response.statusCode == 200 || response.statusCode == 304) {
				//console.log('body=', body)
				//fs.writeFile("screenleap.json", body);
				res.json(JSON.parse(body))

			} else {
				console.log('error=', error)
				//body = JSON.parse(body)

				res.json({
					code: '404'
				})
			}
		});

	},
	post: function(res, req) {
		var url = require('url');
		var url_parts = url.parse(req.url, true);
		var urlStr = url_parts.query.url
		var cookie = url_parts.query.cookie
		var queryParams = url_parts.path.replace('/api/?url=', '');
		queryParams = queryParams.replace(urlStr, '')

		delete queryParams.url;
		queryParams = this.ltrim(queryParams, '&');

		urlStr = 'http://api.reddit.com/' + urlStr + '?' + queryParams.toString();

		var options = {
			url: urlStr,
			headers: {
				Cookie: 'reddit_session=' + cookie,

			},
			form: req.body,
		};

		request.post(options, function(error, response, body) {

			if (error) {
				console.log('error in post=', error)
				res.json({
					code: '404'
				})
			}

			if (!error && response.statusCode == 200 || response.statusCode == 304) {
				//console.log('body=', body)
				//fs.writeFile("screenleap.json", body);
				res.json(JSON.parse(body))

			} else {
				//console.log('error=', error)
				//console.log('body=', body)
				//body = JSON.parse(body)

				res.json(JSON.parse(body))
			}
		});

	},
	getTitle: function(res, req) {

		var url = require('url');
		var url_parts = url.parse(req.url, true);
		var url = url_parts.query.url

		var urlOpts = {
			url: url,
			path: '/',
			port: '80'
		};

		var re = /(<\s*title[^>]*>(.+?)<\s*\/\s*title)>/g;

		request.get(urlOpts, function(error, response, body) {
			if (error) throw error;

			if (!error && (response.statusCode == 200 || response.statusCode == 304)) {
				//console.log('body=', body)
				//fs.writeFile("screenleap.json", body);

				var match = re.exec(body);
				if (match && match[2]) {
					console.log(match[2]);
					res.send(200, match[2])
				}

			} else {
				console.log('error=', error)
				//body = JSON.parse(body)

				res.json({
					code: '404'
				})
			}
		});

		// http.get(urlOpts, function(response, err) {
		// 	console.log(response)
		// 	if (err) throw err;
		// 	response.on('data', function(chunk) {
		// 		var str = chunk.toString();
		// 		var match = re.exec(str);
		// 		if (match && match[2]) {
		// 			console.log(match[2]);
		// 			res.send(200, match[2])
		// 		}
		// 	});
		// });

	},

	ltrim: function(str, chr) {
		var rgxtrim = (!chr) ? new RegExp('^\\s+') : new RegExp('^' + chr + '+');
		return str.replace(rgxtrim, '');
	}

}