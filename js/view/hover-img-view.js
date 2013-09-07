define(['underscore', 'backbone', 'resthub', 'hbs!template/hover-img', 'view/base-view'],
	function(_, Backbone, Resthub, HoverImgTemplate, BaseView) {
		var HoverImgView = BaseView.extend({
			strategy: 'replace',
			template: HoverImgTemplate,
			//tagName: 'span',
			//className: 'hoverImgView',
			events: {
				'click .close': "closeImg", //closes the image out of the comment area
				'mouseover .openedOutBoundLink': 'newImgSelected'
			},

			initialize: function(options) {
				_.bindAll(this);
				var self = this;
				this.url = options.url
				this.ahrefDescription = options.ahrefDescription
				this.originalText = options.originalText
				this.originalHtml = options.originalHtml
				this.displayHtml = this.originalHtml //we do not want to display the original HTML if its only a single link in the comment

				console.log('original text=', this.originalText)
				console.log('ahrefdesc=', this.ahrefDescription)

				if (this.originalText == this.ahrefDescription) {
					//no point in showing the same string twice
					console.log('removing display html')
					this.displayHtml = ''
				}
				this.model = new Backbone.Model({
					url: this.url,
					ahrefDescription: this.ahrefDescription,
					displayHtml: this.displayHtml.replace(/outBoundLink/g, 'openedOutBoundLink'),
					//originalHtml: this.originalHtml.replace('outBoundLink', 'openedOutBoundLink')

				})

				this.render();
				this.$el.removeClass('outBoundLink')

			},
			closeImg: function(e) {
				//this.remove()
				e.preventDefault()
				e.stopPropagation()

				window.twoSecDelay = true //we have to have a delay on the closing of this because the users mouse will be right on the link and it will just reopen
				setTimeout(function() {
					window.twoSecDelay = false
				}, 2000)

				console.log('closing', this.originalHtml)
				this.$el.html(this.originalHtml)
			},
			render: function() {
				this.$el.html(HoverImgTemplate({
					model: this.model.attributes
				}))
			},
			newImgSelected: function(e) {

				var target = $(e.currentTarget)
				var url = $(target).attr("href")
				if (url == this.url) {
					return; //do not process if already have the same selected img
				}
				console.log("NEW img selected")
				if (this.checkIsImg(url) == false) {
					//URL is NOT an image
					//try and fix an imgur link?
					url = this.fixImgur(url)

				}
				if (url != false) {
					this.url = url
					this.$('img').attr('href', this.url)

					if (!this.ahrefDescription) {
						this.ahrefDescription = this.url
					}

					this.$('ahrefDescription').attr('href', this.url)
					this.$('ahrefDescription').text('test')

				}

			}

		});
		return HoverImgView;
	});