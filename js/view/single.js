define([
  'underscore', 'backbone', 'resthub', 'hbs!template/single', 'view/post-row-view', 'view/sidebar-view', 'view/comments-view', 'view/base-view', 'model/single', 'event/channel', 'cookie'],
	function(_, Backbone, Resthub, singleTmpl, PostRowView, SidebarView, CommentsView, BaseView, SingleModel, channel, Cookie) {
		var SingleView = BaseView.extend({

			el: $(".content"),
			template: singleTmpl,
			events: function() {
				var _events = {
					'click #retry': 'tryAgain',
					'click .expando-button': 'toggleExpando'
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
				this.dynamicStylesheet(this.subName)
				this.id = options.id

				this.model = new SingleModel({
					subName: this.subName,
					id: this.id
				});

				this.template = singleTmpl;

				//this.render();
				this.model.fetch({
					success: this.loaded,
					error: this.fetchError
				});

				$(window).resize(this.debouncer(function(e) {
					self.resize()
				}));

			},
			/**************UI functions ****************/
			resize: function() {
				var mobileWidth = 1000; //when to change to mobile CSS
				//change css of 
				var docWidth = $(document).width()
				var newWidth = 0;
				if (docWidth > mobileWidth) {
					newWidth = docWidth - 500;
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

			loaded: function(model, res) {
				this.$('.loading').hide()
				console.log("model loaded from single=", model)
				this.render();

				$(this.el).append("<style id='dynamicWidth'> </style>")
				this.resize()

				this.comments = new CommentsView({
					collection: model.get('replies'),
					model: this.model,
					el: "#commentarea"
					//root: "#commentarea"
				})

			},

		});
		return SingleView;
	});