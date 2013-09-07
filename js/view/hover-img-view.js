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
				this.youtubeID = options.youtubeID
				this.youtubeEmbed = ''

				// console.log('original text=', this.originalText)
				// console.log('ahrefdesc=', this.ahrefDescription)
				// console.log('number of links in this string=', (this.originalHtml.split("href").length - 1))

				if (this.originalText == this.ahrefDescription && (this.originalHtml.split("href").length - 1) == 1) {
					//no point in showing the same string twice
					console.log('removing display html')
					this.displayHtml = ''
				}

				if (this.youtubeID != false) {
					this.youtubeEmbed = this.buildYoutubeEmbed()
					this.$('.imgPreview').hide()
				}

				this.model = new Backbone.Model({
					url: this.url,
					ahrefDescription: this.ahrefDescription,
					displayHtml: this.displayHtml.replace(/outBoundLink/g, 'openedOutBoundLink'),
					youtubeEmbed: this.youtubeEmbed,
					youtubeID: this.youtubeID
					//originalHtml: this.originalHtml.replace('outBoundLink', 'openedOutBoundLink')

				})

				this.render();
				this.$el.removeClass('outBoundLink')

			},
			closeImg: function(e) {
				//this.remove()
				e.preventDefault()
				e.stopPropagation()

				window.Delay = true //we have to have a delay on the closing of this because the users mouse will be right on the link and it will just reopen
				setTimeout(function() {
					window.Delay = false
				}, 1500)

				//console.log('closing', this.originalHtml)
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

				if (url == this.url || window.Delay == true) {
					return; //do not process if already have the same selected img
				}
				var youtubeID = this.youtubeChecker(url);
				//console.log("NEW img hover", url)
				if (this.checkIsImg(url) == false) {
					//URL is NOT an image
					//try and fix an imgur link?
					url = this.fixImgur(url)

				}

				if (url != false || youtubeID != false) {
					this.url = url

					this.ahrefDescription = $(target).text()

					if (youtubeID != false) {
						this.url = $(target).attr("href")
						this.youtubeID = youtubeID
						this.$('.imgPreview').hide()
						this.$('.youtubeEmbed').html(this.buildYoutubeEmbed())

					} else {
						this.$('.imgPreview').show()
						this.$('.youtubeEmbed').html('')
						this.$('.imgPreview').attr('href', this.url)
						this.$('.imgPreview img').attr('src', this.url)
					}
					this.$('.ahrefDescription').attr('href', this.url)
					this.$('.ahrefDescription').html(this.ahrefDescription)

					window.Delay = true //delay the user from switching images because it could hover over a lot at once
					setTimeout(function() {
						window.Delay = false
					}, 300)

				}

			},
			buildYoutubeEmbed: function() {
				return '<iframe width="420" height="315" src="//www.youtube.com/embed/' + this.youtubeID + '" frameborder="0" allowfullscreen></iframe>'

			}

		});
		return HoverImgView;
	});