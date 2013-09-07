define([
  'underscore', 'backbone', 'resthub', 'hbs!template/comment', 'hbs!template/commentMOAR', 'view/hover-img-view', 'view/base-view', 'model/comment', 'event/channel', 'cookie'],
	function(_, Backbone, Resthub, commentTmpl, CommentMOAR, HoverImgView, BaseView, CommentModel, channel, Cookie) {
		var CommentView = BaseView.extend({
			//strategy: 'append',

			events: function() {
				var _events = {
					'click .noncollapsed .expand': "hideThread",
					'click .collapsed .expand': "showThread",
					'click .cancel': 'hideUserInput',

				};

				_events['mouseover #' + this.options.id + ' .outBoundLink'] = "commentLinkHover";
				_events['click #report' + this.options.id] = "reportShow";
				_events['click #reportConfirmYes' + this.options.id] = "reportYes"; //user clicks yes to report 
				_events['click #reportConfirmNo' + this.options.id] = "reportShow"; //user decides not to report this link/comment

				_events['submit #commentreply' + this.options.id] = "comment"; //submits a reply to a comment
				_events['click .upArrow' + this.options.id] = "upvote";
				_events['click .downArrow' + this.options.id] = "downvote";
				_events['click .MOAR' + this.options.id] = "loadMOAR"; //loads more comments
				_events['click #replyToggle' + this.options.id] = "toggleReply"; //shows the textarea to input a comment
				_events['click #mdHelpShow' + this.options.id] = "showMdHelp";
				_events['click #mdHelpHide' + this.options.id] = "hideMdHelp";
				return _events;
			},

			initialize: function(options) {
				_.bindAll(this);
				var self = this;
				//this.collection = options.collection
				this.model = options.model
				this.name = this.model.get('name')
				this.id = this.model.get('id')
				if (this.model.get('kind') == 'more') {
					this.template = CommentMOAR
				} else {
					this.template = commentTmpl
				}

				this.render();
				//console.log("trying to create a new comment view with = ", options)

				this.addOutboundLink()

				this.renderChildren(this.model.get('replies'))

			},
			//add data-external and a special class to any link in a comment
			//once the links have the class outBoundLink on them, they will no longer trigger the hover view
			addOutboundLink: function() {
				this.$('.hoverImgParent a').addClass('outBoundLink').attr("data-bypass", "true"); //makes the link external to be clickable
				this.$('.hoverImgParent a').attr('target', '_blank');
			},
			loadMOAR: function(e) {
				e.preventDefault()
				e.stopPropagation()
				$(this.el).html("<div class='loadingS'></div>")
				var self = this
				//console.log('loading MOAR')
				var link_id = this.model.get('link_id')
				//	url: "/api/?url=api/morechildren&cookie=" + $.cookie('reddit_session');,
				var params = {
					link_id: link_id,
					id: this.id,
					api_type: 'json',
					//sort: 'top',
					children: this.model.get('children').join(","),
					//uh: $.cookie('modhash'), 
					byPassAuth: true
				};
				console.log('MOAR=', params)

				this.api("api/morechildren.json", 'POST', params, function(data) {
					console.log("MOAR done", data)

					if (typeof data !== 'undefined' && typeof data.json !== 'undefined' && typeof data.json.data !== 'undefined' && typeof data.json.data.things !== 'undefined') {
						data.children = data.json.data.things
						var tmpModel = new CommentModel({
							skipParse: true
						})

						var newComments = tmpModel.parseComments(data, link_id)
						self.reRenderMOAR(newComments)
					} else {

						self.render()

					}

				});
			},
			reRenderMOAR: function(newComments) {
				if (typeof newComments !== 'undefined' && newComments.length > 0) {
					//console.log('newcomments=', newComments)
					//pluck the first model in the collection and set it as this model for reRendering
					this.model = newComments.at(0)
					var newComments = newComments.slice(1, newComments.length)
					newComments = new Backbone.Collection(newComments)

					this.model.set('replies', newComments)
					//change template back to normal comment template
					this.template = commentTmpl
					this.render()
					this.renderChildren(this.model.get('replies'))
					this.addOutboundLink()
				}
			},

			hideThread: function(e) {
				e.preventDefault()
				e.stopPropagation()

				this.$('.noncollapsed').hide()
				this.$('.collapsed').show()
				this.$('.child').hide()
				this.$('.midcol').hide()

			},
			showThread: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('.collapsed').hide()
				this.$('.noncollapsed').show()
				this.$('.child').show()
				this.$('.midcol').show()

			},
			//shows the comment reply textbox
			toggleReply: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('#commentreply' + this.model.get('id')).toggle()
			},
			commentLinkHover: function(e) {
				//console.log('hovering over a comment')
				e.preventDefault()
				e.stopPropagation()
				if (window.Delay != true) {
					var target = $(e.currentTarget)

					var url = $(target).attr("href")
					var youtubeID = this.youtubeChecker(url);
					//check if the url is an image we can embed
					if (this.checkIsImg(url) == false) {
						//URL is NOT an image
						//try and fix an imgur link?
						url = this.fixImgur(url)

					}

					if (url != false || youtubeID != false) {

						var ahrefDescription = $(target).text()
						if (!ahrefDescription) {
							ahrefDescription = url
						}

						//$(target).css('float', 'left')
						var originalText = $('#' + this.options.id + ' .outBoundLink:first').parent().parent().text().trim()
						var originalHtml = this.$('#' + this.options.id + ' .outBoundLink:first').parent().parent().html()
						url = $(target).attr("href") //in case it was a youtube video we should reset the url link to pass into the view
						//display the image if it exists
						//maybe create an image view?
						//console.log('hovering over an img', originalText)
						var hoverImgView = new HoverImgView({
							el: target.parent().parent(),
							url: url,
							ahrefDescription: ahrefDescription,
							originalText: originalText,
							originalHtml: originalHtml,
							youtubeID: youtubeID

						});

					}
				}
			},

			renderChildren: function(replies) {
				//var replies = this.model.get('replies')
				if (typeof replies !== 'undefined' && replies != "" && replies != null) {
					var self = this

					replies.each(function(model) {
						var id = model.get('id')
						if (id != "_") {
							var comment = new CommentView({
								model: model,
								id: id,
								strategy: "append",
								root: "#" + self.name
							})
						}

					})

				}
			},
			/**************Fetching functions ****************/
			fetchError: function(response, error) {
				console.log("fetch error, lets retry")

			},

			loaded: function(model, res) {
				this.$('.loading').hide()

				this.render();

			},

		});
		return CommentView;
	});