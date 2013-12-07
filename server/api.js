var fs = require("fs");
var request = require('request');
var async = require('async');

//keeps an array cached of all of the potential subreddit headers
var srHeaderImgs = {}
//var srHeaderImgsJson = '/tmp/my.json';
var srHeaderImgsJson = 'public/data/TMPsubredditList.json';
var currentlyGenerating = false //so we wont try generating 2 at once

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
	getSrList: function(res, req) {
		//res.json(200, JSON.stringify(srHeaderImgs, null, ' '));
		//res.json(srHeaderImgs)
		var self = this
		fs.readFile(srHeaderImgsJson, 'utf8', function(err, data) {
			if (err) {
				console.log('Error: ' + err);
				self.generateHeaderImgs()
				return;
			}

			//only randomly check if the cache expire time is ready to refresh only every  x requests (saves on CPU usage)
			if (Math.floor((Math.random() * 200) + 1) == 2) {
				self.checkTimeStampToRefreshImgs()

			}
			res.setHeader('Cache-Control', 'public, max-age=259200');
			res.send(JSON.parse(data))
		});
	},
	fetchHeaderImg: function(id, next) {
		var options = {
			url: 'http://api.reddit.com/r/' + id + '/about.json'
		}

		request.get(options, function(error, response, body) {
			if (error) {
				next('null')
			}

			var body = JSON.parse(body)
			if (typeof body.data !== 'undefined') {
				next(body.data.header_img)
			} else {
				next('null')
			}

		});
	},

	checkTimeStampToRefreshImgs: function() {
		var self = this
		fs.stat(srHeaderImgsJson, function(err, stats) {
			if (err) {
				console.log('its an error, lets generate')
				self.generateHeaderImgs()
			} else {

				var t1 = new Date()
				var t2 = new Date(stats.ctime)
				var diff = t1.getTime() - t2.getTime()
				//fetch new header images every (60×60×24×4)x1000 seconds
				console.log('diff=', diff)
				if (diff > 34560000) {
					//if (diff > 88888) {
					self.generateHeaderImgs()
				}
			}

		})

	},

	generateHeaderImgs: function() {
		var self = this
		if (currentlyGenerating == false) {
			currentlyGenerating = true
			var inpufile = 'public/data/subredditList.json';
			fs.readFile(inpufile, 'utf8', function(err, data) {
				if (err) {
					console.log('Error: ' + err);
					currentlyGenerating = false
					return;
				}
				data = JSON.parse(data);

				async.forEach(Object.keys(data), function(key, callback) {
					var category = data[key];

					async.forEach(Object.keys(category), function(srkey, secondCallback) {
						var category = data[key];
						srHeaderImgs[key] = []

						self.fetchHeaderImg(category[srkey], function(img) {
							console.log(img)
							//srHeaderImgs[category].imgUrl = img
							srHeaderImgs[key].push({
								header_img: img,
								display_name: category[srkey]
							})
							secondCallback() // tell async that the iterator has completed
						})

					}, function(err) {
						callback();
						console.log('category done');
					});

				}, function(err) {
					console.log('generate file now!');

					fs.writeFile(srHeaderImgsJson, JSON.stringify(srHeaderImgs, null, 4), function(err) {
						currentlyGenerating = false
						if (err) {
							console.log(err);
						} else {
							console.log("JSON saved to " + srHeaderImgsJson);
						}
					});
				});

			});
		}
	},

	ltrim: function(str, chr) {
		var rgxtrim = (!chr) ? new RegExp('^\\s+') : new RegExp('^' + chr + '+');
		return str.replace(rgxtrim, '');
	}

}