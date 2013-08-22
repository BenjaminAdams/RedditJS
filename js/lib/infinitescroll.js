// Created by Jonathan Eatherly, (https://github.com/joneath)
// MIT license
// Version 0.3

(function() {
	Backbone.InfiniScroll = function(collection, options) {
		options = options || {};

		var self = {},
			$target,
			fetchOn,
			page,
			prevScrollY = 0,
			loadingAfter = "start";

		self.collection = collection;
		self.options = _.defaults(options, {
			success: function() {},
			error: function() {},
			target: $(window),
			param: "until",
			extraParams: {},
			untilAttr: "id",
			scrollOffset: 100,
			remove: false,
			strict: false,
			includePage: false,
			loading: false
		});

		var initialize = function() {
			$target = $(self.options.target);
			fetchOn = true;
			page = 1;

			//$target.on("scroll", self.watchScroll);
			$(window).on("scroll", self.watchScroll);
		};

		self.destroy = function() {
			//$target.off("scroll", self.watchScroll);
			$(window).off("scroll", self.watchScroll);
		};

		self.enableFetch = function() {
			fetchOn = true;
		};

		self.disableFetch = function() {
			fetchOn = false;
		};

		self.fetchSuccess = function(collection, response) {

			// if ((self.options.strict && collection.length >= (page + 1) * self.options.pageSize) || (!self.options.strict && response.length > 0)) {
			// 	self.enableFetch();
			// 	page += 1;
			// } else {
			// 	self.disableFetch();
			// }
			//console.log("new collection=", collection) //collection contains everything
			//console.log("new response=", response) //response contains the newest 100
			//collection.slice(begin, end) 

			var length = response.data.children.length;

			if (length > 2) {
				self.enableFetch();
			}

			console.log(collection.length)
			console.log(response)

			response = new Backbone.Collection(collection.slice((collection.length - length), collection.length))
			//self.options.success(collection, response);
			self.options.success(response, response);
			self.options.loading = false

		};

		self.fetchError = function(collection, response) {
			self.enableFetch();
			self.loading = false

			self.options.error(collection, response);
		};

		self.watchScroll = function(e) {

			if (self.loadingAfter == window.after) {
				return; //so we don't keep loading the same reddit page
			}

			var scrollY = $target.scrollTop() + $target.height();
			var docHeight = $target.get(0).scrollHeight;

			if (!docHeight) {
				docHeight = $(document).height();
			}

			if (scrollY >= docHeight - self.options.scrollOffset && fetchOn && prevScrollY <= scrollY) {
				var lastModel = self.collection.last();
				if (!lastModel) {
					return;
				}

				if (self.options.loading == true) {
					return;
				}

				self.loadingAfter = window.after;
				self.options.loading = true

				if (self.loadingAfter != "stop") {
					self.collection.fetch({
						success: self.fetchSuccess,
						//error: self.fetchError,
						//remove: self.options.remove,

					});
				}
			}
			prevScrollY = scrollY;
		};

		initialize();

		return self;
	};
})();