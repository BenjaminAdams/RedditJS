 define([
  'underscore', 'backbone', 'resthub', 'hbs!template/subreddit', 'hbs!template/post-row-small', 'collection/subreddit'],
 	function(_, Backbone, Resthub, subredditTmpl, PostViewSmallTpl, SubredditCollection) {
 		var SubredditView = Resthub.View.extend({

 			el: $("#bottom-bar"),
 			//template: subredditTmpl,

 			events: {
 				'mousemove': 'scrollBottomBar',
 				'mouseleave': 'stopScrolling'
 				//'click .tabmenu-right li': 'changeGridOption',
 				//'click #retry': 'tryAgain',
 				//'click .thumbnailSmall': 'gotoSingle'

 			},

 			initialize: function(options) {
 				//$(this.el).empty()
 				this.$el.empty()
 				this.$el.css('left', 0) //sets the position to the start of the bar

 				_.bindAll(this);
 				var self = this;
 				this.subName = options.subName
 				this.sortOrder = 'hot'
 				this.subID = this.subName + this.sortOrder

 				this.loading = false; //keeps track if we are loading more posts or not
 				this.scrolling = false; //timer for when the users movement over the bottom bar
 				this.guessedWidth = 0 //calculated later by how many posts are in the scrollbar
 				//this.render();

 				if (typeof window.subs[this.subID] === 'undefined') {

 					this.collection = new SubredditCollection({
 						subName: this.subName,
 						sortOrder: this.sortOrder
 					});
 					this.fetchMore();
 				} else {
 					console.log('loading collection from memory')
 					this.collection = window.subs[this.subID]
 					this.appendPosts(this.collection)

 					//this.fetchMore();
 				}

 			},
 			//only scroll every few milaseconds in an interval
 			scrollBottomBar: function(e) {
 				var self = this
 				if (this.scrolling == false) {
 					this.scrolling = true
 					clearTimeout(this.userLeftTimeout)
 					var currentLeft = $('#bottom-bar').css('left').replace('px', '')
 					var centerScreen = $(document).width() / 2

 					if (centerScreen > e.clientX) {
 						//if (currentLeft < 0) {
 						//only scroll left when not at the start
 						//$('#bottom-bar').css('left', '+=10');
 						this.setScrollInt('left', '+=5', e.clientX)
 						//}
 					} else {
 						//$('#bottom-bar').css('left', '-=10');
 						this.setScrollInt('right', '-=5', e.clientX)
 					}

 					//toggle transparency only if it does not exist
 					if (this.$el.hasClass("transparent")) {
 						this.$el.removeClass('transparent')
 					}

 					setTimeout(function() {
 						self.scrolling = false

 					}, 35);
 				}

 			},
 			setScrollInt: function(direction, amount, clientX) {
 				var self = this
 				clearInterval(this.curInterval);
 				if (direction == 'stop') {
 					return;
 				}
 				var docWidthMiddle = $(document).width() / 2
 				var bounds = docWidthMiddle * .65
 				var leftThreshold = docWidthMiddle - bounds
 				var rightThreshold = docWidthMiddle + bounds
 				if ((direction == 'left' && clientX < leftThreshold) || (direction == 'right' && clientX > rightThreshold)) {
 					this.curInterval = setInterval(function() {
 						var currentLeft = $('#bottom-bar').css('left').replace('px', '')
 						if (direction == 'left' && currentLeft < 0) {
 							$('#bottom-bar').css('left', amount);
 						} else if (direction == 'right') {

 							if (self.guessedWidth < currentLeft) {
 								$('#bottom-bar').css('left', amount);
 							} else {
 								if (self.loading == false) {
 									self.fetchMore()
 								}
 							}
 						}

 					}, 10);
 				}
 			},
 			stopScrolling: function() {
 				var self = this
 				this.setScrollInt('stop')

 				this.userLeftTimeout = setTimeout(function() {
 					if (!self.$el.hasClass("transparent")) {
 						self.$el.addClass('transparent')
 					}

 				}, 1500);

 			},
 			fetchMore: function() {
 				if (this.loading == false) {
 					console.log('fetching MOAR')
 					this.loading = true
 					this.collection.fetch({
 						success: this.gotNewPosts,
 						remove: false
 					});
 				}
 			},
 			appendPosts: function(collection) {
 				var self = this
 				this.$el.show()
 				collection.each(function(model) {
 					var str = '<a data-id="' + model.get('name') + '" class="thumbnailSmall" ' + model.get('external') + ' href="' + model.get('url') + '" target="_blank"><img src="' + model.get('thumbnail') + '" ></a>'
 					this.$('#bottom-bar').append(str)

 					// this.$('#bottom-bar').append(PostViewSmallTpl({
 					// 	model: model.attributes
 					// }))
 				})
 				this.guessedWidth = -(this.collection.length * 87)

 			},
 			show: function() {
 				this.$el.show()
 			},
 			gotNewPosts: function(models, res) {

 				if (typeof res.data.children.length === 'undefined') {
 					return; //we might have an undefined length?
 				};
 				var newCount = res.data.children.length

 				var newPosts = new Backbone.Collection(models.slice((models.length - newCount), models.length))
 				this.appendPosts(newPosts)

 				//fetch more  posts with the After
 				if (this.collection.after == "stop") {
 					console.log("AFTER = stop")
 					$(window).off("scroll", this.watchScroll);
 				}
 				this.loading = false; //turn the flag on to go ahead and fetch more!

 				window.subs[this.subID] = this.collection

 			},
 		});
 		return SubredditView;
 	});