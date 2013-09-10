define([
  'underscore', 'backbone', 'resthub', 'hbs!template/single', 'view/post-row-view', 'view/sidebar-view', 'view/comments-view', 'view/base-view', 'model/single', 'event/channel', 'cookie'],
	function(_, Backbone, Resthub, singleTmpl, PostRowView, SidebarView, CommentsView, BaseView, SingleModel, channel, Cookie) {
		var SingleView = BaseView.extend({

			el: $(".content"),
			template: singleTmpl,
			events: function() {
				var _events = {
					'click #retry': 'tryAgain',
					'click .expando-button': 'toggleExpando',

				};
				_events['click #report' + this.options.id] = "reportShow";
				_events['click #reportConfirmYes' + this.options.id] = "reportYes"; //user clicks yes to report 
				_events['click #reportConfirmNo' + this.options.id] = "reportShow"; //user decides not to report this link/comment

				_events['click #hide' + this.options.id] = "hidePost"; //user wants to hide this post
				_events['click #save' + this.options.id] = "savePost"; //user wants to hide this post
				_events['click #unsave' + this.options.id] = "unSavePost"; //user wants to hide this post

				_events['click .upArrow' + this.options.id] = "upvote";
				_events['click .downArrow' + this.options.id] = "downvote";
				return _events;
			},
			// events: {
			// 	'click .upArrow': 'upvote',
			// 	'click .downArrow': 'downvote',
			// 	//  'keyup #new-todo':     'showTooltip'
			// },

			initialize: function(options) {
				_.bindAll(this);

				$(this.el).html('')
				this.scrollTop()
				var self = this;
				this.subName = options.subName
				this.id = options.id
				this.template = singleTmpl;

				this.triggerID()

				if (typeof window.curModel === 'undefined') {
					this.fetchComments(this.loaded)

				} else {
					console.log('loading a model from memory')
					//this is what we do when we pass in a model with out the comments
					this.model = window.curModel
					delete window.curModel; //memory management
					this.renderStuff(this.model);
					//well now we need to get the comments for this post!
					this.fetchComments(this.loadComments)

				}

				$(window).resize(this.debouncer(function(e) {
					self.resize()
				}));
				channel.on("single:remove", this.remove, this);
				channel.on("single:giveBtnBarID", this.triggerID, this);

			},

			fetchComments: function(callback) {
				$('#commentarea').html("<div class='loadingS' style='position:relative;left:30%;'></div>")
				this.comments = new SingleModel({
					subName: this.subName,
					id: this.id,
					parseNow: true,
				});

				//this.render();
				this.comments.fetch({
					success: callback,
					error: this.fetchError
				});

			},
			remove: function() {
				//$(window).unbind('keydown', this.keyPress);
				$(window).off('resize', this.debouncer);
				channel.off("single:remove", this.remove, this);
				this.undelegateEvents();
				this.$el.empty();
				this.stopListening();
				console.log('**********************removed the single view *********************************')

				//call the superclass remove method
				//Backbone.View.prototype.remove.apply(this, arguments);
			},
			/**************UI functions ****************/
			resize: function() {
				var mobileWidth = 1000; //when to change to mobile CSS
				//change css of 

				var docWidth = $(document).width()
				var newWidth = 0;
				if (docWidth > mobileWidth) {
					//if the website is in responsive mode
					newWidth = docWidth - 522;
				} else {
					newWidth = docWidth - 222;
				}
				$('#dynamicWidth').html('<style> .embed img { max-width: ' + newWidth + 'px };   </style>');

			},
			toggleExpando: function() {
				if ($('.expando-button').hasClass('expanded')) {
					$('.expando-button').removeClass('expanded')
					$('.expando-button').addClass('collapsed')
					$('.expando').hide()
				} else {
					$('.expando-button').removeClass('collapsed')
					$('.expando-button').addClass('expanded')
					$('.expando').show()
				}
			},
			triggerID: function() {
				channel.trigger("bottombar:selected", "t3_" + this.id);
			},

			/**************Fetching functions ****************/
			fetchError: function(response, error) {
				console.log("fetch error, lets retry")

				$(this.el).html("<div id='retry' >  <div class='loading'></div> </div> ")

			},
			tryAgain: function() {
				$(this.el).append("<style id='dynamicWidth'> </style>")
				$(this.el).html("<div id='retry' >  <img src='img/sad-icon.png' /><br /> click here to try again </div> ")
				this.model.fetch({
					success: this.loaded,
					error: this.fetchError
				});
			},
			fetchMore: function() {

			},
			renderStuff: function(model) {
				this.render()
				$(this.el).append("<style id='dynamicWidth'> </style>")
				this.resize()

			},
			//if we dont pass in a model we need to render the comments here
			loadComments: function(model, res) {
				$('#commentarea').html('')
				this.comments = new CommentsView({
					collection: model.get('replies'),
					model: this.model,
					el: "#commentarea"
					//root: "#commentarea"
				})
			},
			loaded: function(model, res) {
				this.$('.loading').hide()
				this.model = model
				//this.model = model.parseOnce(model.attributes)
				this.renderStuff(model);
				this.loadComments(model)
				console.log('before activiating btm bar=', model)

			},

		});
		return SingleView;
	});