var fs = require("fs");
var request = require('request');
var async = require('async');

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
		}

		request.get(options, function(error, response, body) {
			if (error) {
				if (typeof response !== 'undefined' && typeof response.statusCode !== 'undefined') {
					res.send(response.statusCode)
				} else {
					res.send(500)
				}
				return
			}

			if (!error && response.statusCode == 200 || response.statusCode == 304) {
				res.json(JSON.parse(body))
			} else {
				res.send(response.statusCode)
			}
		});

	},
	post: function(res, req) {
		var url = require('url');
		var url_parts = url.parse(req.url, true);
		var urlStr = url_parts.query.url
		var cookie = url_parts.query.cookie
		console.log('thisis=', url_parts.path)
		var queryParams = url_parts.path.replace('/api/?url=', '');
		queryParams = url_parts.path.replace('/api/?url=', '');
		//queryParams = queryParams.replace(urlStr, '')
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
			//console.log('resp=', response)
			if (error) {
				console.log(error)
				if (typeof response !== 'undefined' && typeof response.statusCode !== 'undefined') {
					res.send(response.statusCode)
				} else {
					res.send(500)
				}
				return
			}

			if (!error && response.statusCode == 200 || response.statusCode == 304) {

				res.json(JSON.parse(body))

			} else {
				res.send(response.statusCode)
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
			if (error) {
				if (typeof response !== 'undefined' && typeof response.statusCode !== 'undefined') {
					res.send(response.statusCode)
				} else {
					res.send(500)
				}
				return
			}

			if (!error && (response.statusCode == 200 || response.statusCode == 304)) {
				var match = re.exec(body);
				if (match && match[2]) {
					res.send(200, match[2])
				}

			} else {
				//body = JSON.parse(body)
				res.json(404, {
					code: '404'
				})
			}
		});

	},
	ltrim: function(str, chr) {
		var rgxtrim = (!chr) ? new RegExp('^\\s+') : new RegExp('^' + chr + '+');
		return str.replace(rgxtrim, '');
	}

}