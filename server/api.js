var fs = require("fs");
var request = require('request');
var async = require('async');

var REDDIT_CONSUMER_KEY = process.env.REDDIT_KEY;
var REDDIT_CONSUMER_SECRET = process.env.REDDIT_SECRET;

module.exports = {

	get: function(res, req) {

		var url = require('url');

		var url_parts = url.parse(req.url, true);
		var urlStr = url_parts.query.url
		var queryParams = url_parts.path.replace('/api/?url=', '');
		queryParams = queryParams.replace(urlStr, '')

		delete queryParams.url;
		queryParams = this.ltrim(queryParams, '&');

		//urlStr = 'https://oauth.reddit.com/' + urlStr + '?' + queryParams.toString() + '&token=' + req.user.token;
		urlStr = 'https://oauth.reddit.com/r/funny.json'
		//urlStr = 'https://oauth.reddit.com/api/v1/me'
		var authorization = "Basic " + Buffer("" + REDDIT_CONSUMER_KEY + ":" + REDDIT_CONSUMER_SECRET).toString('base64');
		//console.log('AUTHORIZATION=', authorization)
		//console.log('id and secret=', REDDIT_CONSUMER_KEY + ":" + REDDIT_CONSUMER_SECRET)
		// var post_headers = {
		// 	//'Content-Type': 'application/x-www-form-urlencoded',
		// 	'Authorization': authorization,
		// 	//'Authorization': "bearer " + req.user.token,
		// 	'authToken': req.user.token,
		// 	'access_token': req.user.token,
		// 	'token': req.user.token
		// };

		console.log('url=', urlStr)

		var options = {
			url: urlStr,
			//url: 'https://oauth.reddit.com/api/v1/me',
			headers: {
				//'Content-Type': 'application/x-www-form-urlencoded',
				'User-Agent': 'RedditJS username:' + req.user.name,
				//'Authorization': authorization,
				'Authorization': "bearer " + req.user.token,
				'authToken': req.user.token,
				'access_token': req.user.token,
				'token': req.user.token

			},
			form: url_parts.query
		}

		console.log('user =', req.user)

		//this._request("POST", this._getAccessTokenUrl(), post_headers, post_data, null, function(error, data, response) {

		//DATA https://ssl.reddit.com/api/v1/access_token { 'Content-Type': 'application/x-www-form-urlencoded',Authorization: 'Basic d0hBUWo2UEFEZzcxbkE6QWhubEpxdHBuY0Vuakt0WU5ORWRmbGdFdVZB'}grant_type = authorization_code & redirect_uri = http % 3A % 2F % 2Flocalhost % 3A8002 % 2Fauth % 2Freddit % 2Fcallback & type = web_server & code = Fa3JgiVgDsaB7hCD0dFcbunxVb0 null

		request.get(options, function(error, response, body) {
			//request.get(urlStr, post_headers, function(error, response, body) {
			if (error) {
				if (typeof response !== 'undefined' && typeof response.statusCode !== 'undefined') {
					res.send(response.statusCode)
				} else {
					res.send(500)
				}
				return
			}

			console.log('body=', body)

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
	oauthGet: function(res, req) {

		//var url = require('url');

		//var url_parts = url.parse(req.url, true);
		//var urlStr = url_parts.query.url
		//var cookie = url_parts.query.cookie
		//var queryParams = url_parts.path.replace('/api/?url=', '');
		//queryParams = queryParams.replace(urlStr, '')

		//delete queryParams.url;
		//queryParams = this.ltrim(queryParams, '&');

		//https://oauth.reddit.com/api/v1/me.json
		//urlStr = 'https://oauth.reddit.com/' + urlStr + '?' + queryParams.toString();
		urlStr = 'https://oauth.reddit.com/api/v1/me.json'

		var options = {
			url: urlStr,
			headers: {
				//Cookie: 'reddit_session=' + cookie,
				authorization_code: req.session.state
				//req.session.state

			}
			//form: url_parts.query,
		}

		request.get(options, function(error, response, body) {
			if (error) {
				console.log('ERROR=', error)
				if (typeof response !== 'undefined' && typeof response.statusCode !== 'undefined') {
					res.send(response.statusCode)
				} else {
					res.send(500)
				}
				return
			}

			if (!error && response.statusCode == 200 || response.statusCode == 304) {
				console.log('SUCCESS=', body)
				//res.json(JSON.parse(body))
			} else {
				console.log('SUCCESS=', body)
				//res.send(response.statusCode)
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