 define([
  'underscore', 'backbone', 'resthub', 'hbs!template/subreddit', 'hbs!template/post-row-small', 'collection/subreddit'],
 	function(_, Backbone, Resthub, subredditTmpl, PostViewSmallTpl, SubredditCollection) {
 		var SubredditView = Resthub.View.extend({

 			el: $("#bottom-bar"),
 			//template: subredditTmpl,

 			events: {
 				'mousemove': 'scrollBottomBar'
 				//'click .tabmenu-right li': 'changeGridOption',
 				//'click #retry': 'tryAgain',
 				//'click .thumbnailSmall': 'gotoSingle'

 			},

 			initialize: function(options) {
 				//$(this.el).empty()
 				this.$el.empty()

 				_.bindAll(this);
 				var self = this;
 				this.subName = options.subName
 				this.sortOrder = 'hot'
 				this.subID = this.subName + this.sortOrder

 				this.scrolling = false

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

 				this.loading = false;

 			},
 			//only scroll every few milaseconds in an interval
 			scrollBottomBar: function(e) {
 				var self = this
 				if (this.scrolling == false) {
 					this.scrolling = true
 					var currentLeft = $('#bottom-bar').css('left')

 					currentLeft = currentLeft.replace('px', '')
 					console.log('curleft=', currentLeft)
 					var centerScreen = $(document).width() / 2
 					if (centerScreen > e.clientX) {
 						if (currentLeft < 0) {
 							$('#bottom-bar').css('left', '+=10');
 						}
 					} else {
 						$('#bottom-bar').css('left', '-=10');
 					}

 					setTimeout(function() {
 						self.scrolling = false

 					}, 20);
 				}

 			},
 			fetchMore: function() {
 				this.collection.fetch({
 					success: this.gotNewPosts,
 					remove: false
 				});
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