var fs = require("fs");
var request = require('request');
var async = require('async');

//keeps an array cached of all of the potential subreddit headers
var srHeaderImgs = {}
//var srHeaderImgsJson = '/tmp/my.json';
var srHeaderImgsJson = '../public/data/TMPsubredditList.json';
var currentlyGenerating = false //so we wont try generating 2 at once

module.exports = {

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
				//if (diff > 34560000) {
				if (diff > 88) {
					self.generateHeaderImgs()
				}
			}

		})

	},
	fetchHeaderImg: function(id, next) {
		var options = {
			url: 'http://api.reddit.com/r/' + id + '/about.json'
		}

		request.get(options, function(error, response, body) {
			//for some reason its responding with ' undefined'  with a space sometimes
			if (error || typeof body === 'undefined' || body == 'undefined') {
				next('null')
				return
			}

			console.log('body=', body)
			console.log('resp from url=', options.url)

			var body = JSON.parse(body)

			if (typeof body.data !== 'undefined') {
				next(body.data.header_img)
			} else {
				next('null')
			}

		});
	},
	generateHeaderImgs: function() {
		var self = this
		if (currentlyGenerating == false) {
			currentlyGenerating = true
			var inpufile = '../public/data/subredditList.json';
			fs.readFile(inpufile, 'utf8', function(err, data) {
				if (err) {
					console.log('Error: ' + err);
					currentlyGenerating = false
					return;
				}
				data = JSON.parse(data);

				async.forEach(Object.keys(data), function(key, callback) {
					var category = data[key];
					//console.log(key)
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
						//console.log('category done', key);
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
	}

}