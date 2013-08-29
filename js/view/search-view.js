define(['view/subreddit-view', 'collection/search', 'hbs!template/search', 'event/channel', ],
	function(SubredditView, SearchCollection, SearchTmpl, channel) {
		var SearchView = SubredditView.extend({

			el: $(".content"),
			template: SearchTmpl,

			events: function() {
				return _.extend({}, SubredditView.prototype.events, {
					'submit .searchMain': 'gotoSearch',
					'click .drop-sort-order': 'toggleSort',
					'click .drop-sort-orderA': 'toggleSort',
					'click .drop-time-frame': 'toggleTimeFrame',
					'click .drop-time-frameA': 'toggleTimeFrame',
				});
			},

			initialize: function(options) {
				//$(this.el).empty()
				//this.$el.empty()

				_.bindAll(this);
				var self = this;
				this.template = SearchTmpl;
				this.subName = "Search"
				this.searchQ = decodeURIComponent(options.searchQ);
				this.timeFrame = options.timeFrame

				if (typeof this.timeFrame === 'undefined') {
					this.timeFrame = 'month' //the default sort order is hot
				};
				this.sortOrder = options.sortOrder

				if (typeof this.sortOrder === 'undefined') {
					this.sortOrder = 'relevance'
				}

				this.model = new Backbone.Model({
					searchQ: this.searchQ,
					timeFrame: this.timeFrame,
					sortOrder: this.sortOrder
				})

				this.subID = this.subName + this.sortOrder
				channel.on("subreddit:changeGridOption", this.changeGridOption, this);
				channel.on("subreddit:remove", this.remove, this);

				this.initGridOption();

				this.render();

				$(this.el).prepend("<style id='dynamicWidth'> </style>")

				$(this.el).append("<div class='loading'> </div>")
				this.collection = new SearchCollection({
					timeFrame: this.timeFrame,
					sortOrder: this.sortOrder,
					searchQ: this.searchQ
				});
				this.fetchMore();

				$(window).on("scroll", this.watchScroll);

				//in small thumbnail mode, its sometimes impossible for the infinite scroll event to fire because there is no scrollbar yet
				this.helpFillUpScreen();

				//this.target = $("#siteTable"); //the target to test for infinite scroll
				this.target = $(window); //the target to test for infinite scroll
				this.loading = false;
				this.scrollOffset = 1000;
				this.prevScrollY = 0; //makes sure you are not checking when the user scrolls upwards
				this.errorRetries = 0; //keeps track of how many errors we will retry after

				//$(window).bind("resize.app", _.bind(this.debouncer));
				$(window).resize(this.debouncer(function(e) {
					self.resize()
				}));
				this.resize()

				setTimeout(function() {
					self.changeSortOrderCss()
				}, 100);

			},
			toggleSort: function(e) {
				//e.preventDefault()
				//e.stopPropagation()
				this.$('.drop-sort-orderA').toggle()
				this.$('.drop-time-frameA').hide()
			},
			toggleTimeFrame: function(e) {
				//e.preventDefault()
				//e.stopPropagation()
				this.$('.drop-time-frameA').toggle()
				this.$('.drop-sort-orderA').hide()
			},

			gotNewPosts: function(models, res) {
				this.$('.loading').hide()

				if (typeof res.data.children.length === 'undefined') {
					return;
				};
				var newCount = res.data.children.length

				var newModels = new Backbone.Collection(models.slice((models.length - newCount), models.length))
				this.appendPosts(newModels)

				//fetch more  posts with the After
				if (this.collection.after == "stop") {
					console.log("AFTER = stop")
					$(window).off("scroll", this.watchScroll);
				}
				this.loading = false; //turn the flag on to go ahead and fetch more!
				this.helpFillUpScreen()
				//window.subs[this.subID] = this.collection

			},

			helpFillUpScreen: function() {
				if (this.collection.length < 301 && this.gridOption == 'small') {
					this.watchScroll()
				}
			},
			gotoSearch: function(e) {
				e.preventDefault()
				e.stopPropagation()
				var q = encodeURIComponent(this.$('.mainQ').val())
				Backbone.history.navigate('/search/' + q, {
					trigger: true
				})

			},

		});
		return SearchView;
	});