define(['App', 'underscore', 'backbone', 'hbs!template/comment', 'hbs!template/commentMOAR', 'view/hover-img-view', 'view/basem-view', 'model/comment', 'cView/comments', 'collection/comments', 'cookie'],
	function(App, _, Backbone, commentTmpl, CommentMOAR, HoverImgView, BaseView, CommentModel, CViewComments, CommentCollection, Cookie) {
		return BaseView.extend({
			//strategy: 'append',
			template: commentTmpl,
			events: {

				'click .noncollapsed .expand': "hideThread",
				'click .collapsed .expand': "showThread",
				'click .cancel': 'hideUserInput',
				'click .MOAR': 'loadMOAR',
				'click .upArrow': 'upvote',
				'click .downArrow': 'downvote',
				'mouseover .outBoundLink': 'commentLinkHover',
				'click .report': 'reportShow',
				'click .reportConfirmYes': 'reportYes',
				'click .reportConfirmNo': 'reportShow',
				'submit .commentreply': 'comment',
				'click .replyToggle': 'toggleReply',
				'click .mdHelpShow': 'showMdHelp',
				'click .mdHelpHide': 'hideMdHelp'

			},
			regions: {
				replies: '.replies',
				hoverImgParent: '.hoverImgParent:first'
			},
			ui: {
				upArrow: '.upArrow',
				downArrow: '.downArrow',
				midcol: '.midcol',
				'noncollapsed': '.noncollapsed',
				'collapsed': '.collapsed',
				'child': '.child',
				'commentreply': '.commentreply',
				'text': '.text',
				'status': '.status',
				'mdHelp': '.mdHelp',
				'mdHelpShow': '.mdHelpShow',
				'mdHelpHide': '.mdHelpHide',
				'reportConfirm': '.reportConfirm',
				'reportConfirmYes': '.reportConfirmYes'
			},

			initialize: function(options) {
				_.bindAll(this);
				var self = this;

				this.model = options.model
				//this.collection = new CommentCollection()
				this.collection = this.model.get('replies')
				if (typeof this.collection === 'undefined' || this.collection === null || this.collection.length === 0) {
					//console.log('empty')
					this.collection = new CommentCollection()
				}
				this.name = this.model.get('name')
				this.id = this.model.get('id')
				if (this.model.get('kind') == 'more') {
					this.template = CommentMOAR
				} else {
					this.template = commentTmpl
				}
				App.on("comment:addOneChild" + this.model.get('name'), this.addOneChild, this);

			},
			onRender: function() {
				var self = this
				var CommentView = require('view/comment-view')

				self.commentCollectionView = new CViewComments({
					collection: self.collection,
					itemView: CommentView
				})

				self.replies.show(self.commentCollectionView)

				this.addOutboundLink()
				this.permalinkParent = this.model.get('permalinkParent')
				//this.model.set('permalinkParent', options.permalinkParent)
				//this.renderChildren(this.model.get('replies'))
			},
			addOneChild: function(model) {
				this.collection.add(model)
				//this.commentCollectionView.collection.add(model)
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
					//console.log("MOAR done", data)

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
					newComments = newComments.slice(1, newComments.length)
					newComments = new Backbone.Collection(newComments)

					this.model.set('permalink', this.permalinkParent + this.model.get('id'))
					this.model.set('permalinkParent', this.permalinkParent)

					//this.model.set('replies', newComments)
					//change template back to normal comment template
					this.template = commentTmpl
					this.$el.empty()
					this.render()

					this.renderOtherReplyComments(newComments)
					var replies = this.model.get('replies')
					//this.renderChildren(replies)
					this.collection.add(replies)
					this.addOutboundLink()
				}
			},

			hideThread: function(e) {
				e.preventDefault()
				e.stopPropagation()

				this.ui.noncollapsed.hide()
				this.ui.collapsed.show()
				this.ui.child.hide()
				this.ui.midcol.hide()

			},
			showThread: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.ui.collapsed.hide()
				this.ui.noncollapsed.show()
				this.ui.child.show()
				this.ui.midcol.show()

			},
			//shows the comment reply textbox
			toggleReply: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.ui.commentreply.toggle()
			},
			commentLinkHover: function(e) {
				//console.log('hovering over a comment')
				e.preventDefault()
				e.stopPropagation()
				if (window.settings.get('cmtLoad') === true) {
					if (window.Delay !== true) {
						var target = $(e.currentTarget)

						var url = $(target).attr("href")

						var youtubeID = this.youtubeChecker(url);
						//check if the url is an image we can embed
						if (youtubeID === false) {
							url = url.replace(/(\?.*)|(#.*)|(&.*)/g, "")
						}
						if (this.checkIsImg(url) === false) {
							//URL is NOT an image
							//try and fix an imgur link?
							url = this.fixImgur(url)

						}

						if (url !== false || youtubeID !== false) {

							var ahrefDescription = $(target).text()
							if (!ahrefDescription) {
								ahrefDescription = url
							}

							//$(target).css('float', 'left')
							var originalText = $('.outBoundLink:first').parent().parent().text().trim()
							var originalHtml = this.$('.outBoundLink:first').parent().parent().html()
							if (youtubeID) {
								url = $(target).attr("href") //in case it was a youtube video we should reset the url link to pass into the view
							}
							//display the image if it exists
							//maybe create an image view?
							//console.log('hovering over an img', originalText)
							// var hoverImgView = new HoverImgView({
							// 	el: target.parent().parent(),
							// 	url: url,
							// 	ahrefDescription: ahrefDescription,
							// 	originalText: originalText,
							// 	originalHtml: originalHtml,
							// 	youtubeID: youtubeID

							// });
							this.hoverImgParent.show(new HoverImgView({
								url: url,
								ahrefDescription: ahrefDescription,
								originalText: originalText,
								originalHtml: originalHtml,
								youtubeID: youtubeID

							}))

						}
					}
				}
			},

			//renderChildren: function(replies) {
			//this.collection.add(replies)
			//},
			renderOtherReplyComments: function(collection) {
				console.log('other replies', collection)
				var self = this
				collection.each(function(model) {
					App.trigger("comment:addOneChild" + model.get('parent_id'), model);
				})

			},
			/**************Fetching functions ****************/
			fetchError: function(response, error) {
				console.log("fetch error, lets retry")

			},

			loaded: function(model, res) {
				this.$('.loading').hide()
				this.render();
			}

		});

	});