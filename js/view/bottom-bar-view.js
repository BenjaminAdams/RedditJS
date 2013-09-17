 define([
  'underscore', 'backbone', 'resthub', 'hbs!template/subreddit', 'hbs!template/post-row-small', 'collection/subreddit', 'event/channel'],
 	function(_, Backbone, Resthub, subredditTmpl, PostViewSmallTpl, SubredditCollection, channel) {
 		var SubredditView = Resthub.View.extend({

 			el: $("#bottom-bar"),
 			//template: subredditTmpl,

 			events: {
 				'mousemove': 'scrollBottomBar',
 				'mouseleave': 'stopScrolling',
 				'click .thumbnailSmall': 'gotoSingle'
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
 				this.selectedID = false;
 				this.pixelsOfOneImg = 97.5

 				channel.on("bottombar:selected", this.selected, this); //when the user focuses on a single post page
 				channel.on("btmbar:remove", this.remove, this); //clears everthing in this view
 				$(window).bind('keydown', this.keyPress); //remove this later!
 				channel.trigger("single:giveBtnBarID"); //ask the single view to give you the btm bar ID to make active

 				this.loading = false; //keeps track if we are loading more posts or not
 				this.scrolling = false; //timer for when the users movement over the bottom bar
 				this.guessedWidth = 0 //calculated later by how many posts are in the scrollbar

 				if (typeof window.subs[this.subID] === 'undefined') {

 					this.collection = new SubredditCollection({
 						subName: this.subName,
 						sortOrder: this.sortOrder
 					});

 					this.fetchMore();

 					// this.selected(this.selectedID) //we either select the active post onload or when the user's page finally loads
 				} else {
 					console.log('loading collection from memory')
 					this.collection = window.subs[this.subID]
 					this.appendPosts(this.collection)
 					this.selected(this.selectedID)

 				}

 			},

 			remove: function() {
 				$(window).unbind('keydown', this.keyPress);
 				channel.off("single:remove", this.remove, this);
 				this.undelegateEvents();
 				this.$el.empty();
 				this.stopListening();
 				console.log('********removed the btm bar **')

 				//call the superclass remove method
 				//Backbone.View.prototype.remove.apply(this, arguments);
 			},
 			keyPress: function(e) {
 				console.log('keydown', e.which)

 				if (e.target.tagName.toLowerCase() !== 'input' && e.target.tagName.toLowerCase() !== 'textarea') {

 					if (e.which == 39) //right key
 					{
 						console.log('right keypress')
 					} else if (e.which == 37) { //left key
 						console.log('left keypress')
 					}
 				}
 			},
 			//when the user goes to a single post page, that ID will become selected in the bottom bar
 			//only trigger this function after we have the entire subreddit data
 			selected: function(name) {
 				this.selectedID = name

 				//console.log('data=', data)
 				console.log('name', name)
 				//$('a[data-attribute=true]')
 				this.$('.selectedBtmBar').removeClass('selectedBtmBar')
 				this.$('#' + name).addClass('selectedBtmBar')

 				//move the btm bar to the active ID
 				// if (typeof this.collection !== "undefined" && this.collection.length > 15) {
 				// 	//find the active model's index in the collection
 				// 	//gets its index, multiply it by how wide it is
 				// 	console.log(this.collection)
 				// 	var count = 0
 				// 	var foundIndex = 0
 				// 	_.each(this.collection.models, function(model) {

 				// 		if (model.get('name') == name) {
 				// 			foundIndex = count;
 				// 		}
 				// 		count++;
 				// 	});
 				// 	console.log('found idnex=', foundIndex)
 				// 	var centerScreen = $(document).width() / 2
 				// 	//var model = this.collection.at(id)
 				// 	var leftPos = (foundIndex * this.pixelsOfOneImg) - (centerScreen - (this.pixelsOfOneImg * 3)) //make the selected index appear in the center

 				// 	console.log('new left pos=', leftPos)
 				// 	//rotate the bar to the active img
 				// 	if (foundIndex > 15) {
 				// 		this.$el.css('left', -leftPos)
 				// 	}
 				// }

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

 							if ((self.guessedWidth > currentLeft - 1100) && self.loading == false) {
 								self.fetchMore()
 							} else if (self.guessedWidth < currentLeft) {
 								$('#bottom-bar').css('left', amount);
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
 					this.showLoading()

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
 				console.log(collection)
 				collection.each(function(model) {
 					var thumbnail = model.get('thumbnail')

 					if (typeof thumbnail !== 'undefined') {

 						var str = '<a id="' + model.get('name') + '" data-id="' + model.get('name') + '" class="thumbnailSmall" ' + model.get('external') + ' href="' + model.get('url') + '" target="_blank"><img src="' + model.get('thumbnail') + '" ></a>'
 						this.$('#bottom-bar').append(str)
 					}
 					// this.$('#bottom-bar').append(PostViewSmallTpl({
 					// 	model: model.attributes
 					// }))
 				})
 				this.guessedWidth = -(this.collection.length * this.pixelsOfOneImg)
 				this.hideLoading()

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
 				//this.selected(this.selectedID) //leaving this here caused the selected post to highlight every fetch

 			},
 			gotoSingle: function(e) {
 				var name = this.$(e.currentTarget).data('id')
 				window.curModel = this.collection.findWhere({
 					name: name
 				})
 				console.log('curmodel=', window.curModel)
 				this.selected(name) //using the router to goto the selected link, pre selecting this post before we travel there
 			},
 			showLoading: function() {
 				this.$el.append('<img class="btmbar-loading" src="img/loading.gif" />')
 			},
 			hideLoading: function() {
 				$('.btmbar-loading').remove()
 			}
 		});
 		return SubredditView;
 	});