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
			pageSize,
			prevScrollY = 0,
			loadingAfter = "start",
			loading = false;

		pageSize = collection.length || 25;

		self.collection = collection;
		self.options = _.defaults(options, {
			success: function() {},
			error: function() {},
			onFetch: function() {},
			target: $(window),
			param: "until",
			extraParams: {},
			pageSizeParam: "page_size",
			untilAttr: "id",
			pageSize: pageSize,
			scrollOffset: 100,
			remove: false,
			strict: false,
			includePage: false
		});

		var initialize = function() {
			$target = $(self.options.target);
			fetchOn = true;
			page = 1;

			//$target.on("scroll", self.watchScroll);
			$(window).on("scroll", self.watchScroll);
		};

		self.destroy = function() {
			$target.off("scroll", self.watchScroll);
		};

		self.enableFetch = function() {
			fetchOn = true;
		};

		self.disableFetch = function() {
			fetchOn = false;
		};

		self.onFetch = function() {
			self.options.onFetch();
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

			response = new Backbone.Collection(collection.slice((collection.length - length), collection.length))
			//self.options.success(collection, response);
			self.options.success(response, response);
			self.loading = false
		};

		self.fetchError = function(collection, response) {
			self.enableFetch();

			self.options.error(collection, response);
		};

		self.watchScroll = function(e) {

			if (self.loadingAfter == window.after) {
				console.log('after still the same')
				return; //so we don't keep loading the same reddit page
			}
			//console.log('window after=', window.after)

			var queryParams,
				scrollY = $target.scrollTop() + $target.height(),
				docHeight = $target.get(0).scrollHeight;

			if (!docHeight) {
				docHeight = $(document).height();
			}

			console.log(scrollY, docHeight)

			if (scrollY >= docHeight - self.options.scrollOffset && fetchOn && prevScrollY <= scrollY) {
				var lastModel = self.collection.last();
				if (!lastModel) {
					return;
				}
				if (self.loading == true) {
					return;
				}

				self.loadingAfter = window.after;
				self.loading = true

				self.onFetch();
				self.disableFetch();
				self.collection.fetch({
					success: self.fetchSuccess,
					error: self.fetchError,
					remove: self.options.remove,
					data: $.extend(buildQueryParams(lastModel), self.options.extraParams)
				});
			}
			prevScrollY = scrollY;
		};

		function buildQueryParams(model) {
			var params = {};

			params[self.options.param] = typeof(model[self.options.untilAttr]) === "function" ? model[self.options.untilAttr]() : model.get(self.options.untilAttr);
			params[self.options.pageSizeParam] = self.options.pageSize;

			if (self.options.includePage) {
				params["page"] = page + 1;
			}

			return params;
		}

		initialize();

		return self;
	};
})();