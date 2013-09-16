define(['backbone', 'model/single', "moment"], function(Backbone, SingleModel) {

	var SubredditCollection = Backbone.Collection.extend({

		initialize: function(data) {
			_.bindAll(this);

			this.after = ""
			this.subName = data.subName
			this.sortOrder = data.sortOrder
			this.count = 1
			if (typeof this.sortOrder === 'undefined') {
				this.sortOrder = 'hot' //the default sort order is hot
			};
			//this.sortOrder = "/" + this.sortOrder //needs to start with a slash to be injected into the URL
			this.subID = this.subName + this.sortOrder

			//this.bind("change", this.saveLocalStorage, this);
			this.bind("sync", this.saveLocalStorage);

			this.instanceUrl = this.getUrl()

		},
		// Reference to this collection's model.
		model: SingleModel,

		url: function() {

			return this.instanceUrl //keeps a dynamic URL so we can give it a new "after"
		},

		getUrl: function() {

			var username = $.cookie('username')
			var linkCount = window.settings.get('linkCount')

			if (typeof username !== "undefined") {
				if (this.subName == "front") {
					return "/api/?url=" + this.sortOrder + ".json&after=" + this.after + "&limit=" + linkCount + "&cookie=" + $.cookie('reddit_session');
				} else {

					return '/api/?url=r/' + this.subName + "/" + this.sortOrder + ".json&limit=" + linkCount + "&after=" + this.after + "&sort=" + this.sortOrder + "&cookie=" + $.cookie('reddit_session');
				}
			} else {
				//if user is NOT logged in, use jsonp request
				if (this.subName == "front") {

					return "http://api.reddit.com/" + this.sortOrder + ".json?after=" + this.after + "&limit=" + linkCount + "&jsonp=?"
				} else {
					return "http://api.reddit.com/r/" + this.subName + "/" + this.sortOrder + ".json?after=" + this.after + "&limit=" + linkCount + "&jsonp=?"
					//return '/api/?url=r/' + this.subName + this.sortOrder + ".json?after=" + this.after + "&sort=" + this.sortOrder + "&cookie=" + $.cookie('reddit_session');
				}
			}

		},

		parse: function(response) {
			//set the after for pagination
			// if (this.doNoParse == true) {
			// 	this.doNoParse = false; //so we parse it next time
			// 	return response
			// }
			console.log(response)
			if (typeof response === 'undefined' || response.length == 0) {
				return
			}
			this.after = response.data.after;

			if (this.after == "" || this.after == null) {
				this.after = "stop" //tells us we have finished downloading all of the possible posts in this subreddit
			}

			var modhash = response.data.modhash;
			if (typeof modhash == "string" && modhash.length > 5) {
				$.cookie('modhash', modhash, {
					path: '/'
				});
			}

			var self = this;
			var models = Array();
			_.each(response.data.children, function(item) {
				if (item.data.hidden == false) {

					var singleModel = new SingleModel({
						subName: this.subName,
						id: item.data.id,
						parseNow: false
					});
					item.data = singleModel.parseOnce(item.data)
					item.data.count = self.count

					if ((self.count % 2) == 0) {
						item.data.evenOrOdd = "even"
					} else {
						item.data.evenOrOdd = "odd"
					}

					self.count++;

					models.push(item.data)
				}
			});

			//reset the url to have the new after tag
			this.instanceUrl = this.getUrl()
			return models;
		},
		saveLocalStorage: function() {

			var now = Math.round(new Date().getTime() / 1000)
			var storeThis = new Object();
			storeThis.models = JSON.stringify(this.models)
			storeThis.after = this.after
			//storeThis.subID = this.subID
			//storeThis.subName = this.subName
			//storeThis.sortOrder = this.sortOrder
			storeThis.instanceUrl = this.instanceUrl
			if (typeof this.expires === 'undefined') {
				this.expires = now + (60 * 10) //add 10 minutes to expire time
			}
			storeThis.expires = this.expires

			if (this.expires < now) {
				console.log('deleting local storage')
				localStorage.removeItem(this.subID)
				delete this.expires
			} else if (this.models.length < 98) { //only store the first 98 models in localstorage
				console.log('saving to local storage')
				window.localStorage.setItem(this.subID, JSON.stringify(storeThis));
			}
		},
		readLocalStorage: function(localStorageData) {

			var localStorageData = window.localStorage.getItem(this.subID);
			if (typeof localStorageData !== 'undefined' && localStorageData != null) {
				var now = Math.round(new Date().getTime() / 1000)
				console.log('setting the local storage to this')
				var storedData = JSON.parse(localStorageData)
				var models = JSON.parse(storedData.models)
				this.add(models)
				this.after = storedData.after
				//	this.subID = storedData.subID
				//	this.subName = storedData.subName
				//	this.sortOrder = storedData.sortOrder
				this.instanceUrl = storedData.instanceUrl
				this.expires = storedData.expires

				if (this.expires < now) {
					localStorage.removeItem(this.subID)
					delete this.expires
				}
			}

		}

	});
	return SubredditCollection;
});