define(['underscore', 'backbone', 'hbs!template/hover-img', 'view/basem-view'],
	function(_, Backbone, HoverImgTemplate, BaseView) {
		return BaseView.extend({
			template: HoverImgTemplate,
			//tagName: 'span',
			//className: 'hoverImgView',
			events: {
				'click .close': "closeImg", //closes the image out of the comment area
				'mouseover .openedOutBoundLink': 'newImgSelected'
			},
			ui: {
				'imgPreview': '.imgPreview',
				'imgTitle': '.imgTitle',
				'hoverImgView': '.hoverImgView',
				'youtubeEmbed': '.youtubeEmbed',
				'ahrefDescription': '.ahrefDescription'
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

				//console.log('original text=', this.originalText)
				// console.log('ahrefdesc=', this.ahrefDescription)
				// console.log('number of links in this string=', (this.originalHtml.split("href").length - 1))

				if (this.originalText == this.ahrefDescription && (this.originalHtml.split("href").length - 1) == 1) {
					//no point in showing the same string twice
					this.displayHtml = ''
				}

				this.model = new Backbone.Model({
					url: this.url,
					ahrefDescription: this.ahrefDescription,
					displayHtml: this.displayHtml.replace(/outBoundLink/g, 'openedOutBoundLink'),
					youtubeEmbed: this.youtubeEmbed,
					youtubeID: this.youtubeID
					//originalHtml: this.originalHtml.replace('outBoundLink', 'openedOutBoundLink')

				})
				//this.render()

			},

			onRender: function() {
				if (this.youtubeID !== false) {
					this.youtubeEmbed = this.buildYoutubeEmbed()
					this.ui.imgPreview.hide()
				}

				this.$el.removeClass('outBoundLink')
				this.loadImg()

				//add the background image in the custom CSS of from the header
				this.addHeaderGBimg()

			},

			loadImg: function() {
				var self = this

				if (this.youtubeID === false) {
					this.ui.imgPreview.html('<img src="img/loading.gif" />')

					$('<img src="' + this.url + '" />').load(function() {
						console.log('loaded img')
						self.ui.imgPreview.html(this)
						self.ui.imgPreview.find('img').show() //sometimes the custom CSS from subreddits hide images

					}).error(function() {
						console.log("ERROR loading img")
						self.ui.imgPreview.html('<img src="img/sad-icon.png" />').show()
						self.ui.imgPreview.find('img').show()
					});

				} else {
					this.ui.youtubeEmbed.html(this.youtubeEmbed)
				}
			},
			addHeaderGBimg: function() {

				var bgImg = $('#header').css('background-image')

				if (bgImg != 'none') {
					//var border = $('.tabmenu li a').css('border')
					var color = $('.tabmenu li a').css('color')
					var linkColor = $('.tabmenu li.selected a').css('color')
					//this.$('.hoverImgView').css('color', color)

					this.ui.imgTitle.css('background-image', bgImg, 'important')
					this.ui.imgTitle.find('a').css('color', linkColor, 'important')
					//this.$('h3').css('border', border, 'important')
				}

				var headerImg = $('#header-img').attr('src')
				if (typeof headerImg !== 'undefined') {
					this.ui.hoverImgView.append("<style>.hoverImgView::after{ content:'';background:url(" + headerImg + ") no-repeat bottom right; opacity:0.15;top:0;left:0;right:0;bottom:0;position:absolute;z-index:-1; }</style>");

				}

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
				this.$el.html("<div class='md'>" + this.originalHtml + "</div>")
			},

			newImgSelected: function(e) {

				var target = $(e.currentTarget)
				var url = $(target).attr("href")
				console.log(url, this.url)

				if (url == this.url || window.Delay === true) {
					return; //do not process if already have the same selected img
				}
				var youtubeID = this.youtubeChecker(url);

				if (this.checkIsImg(url) === false) {
					//URL is NOT an image
					//try and fix an imgur link?
					url = this.fixImgur(url)

				}

				if (url !== false || youtubeID !== false) {
					this.url = url

					this.ahrefDescription = $(target).text()

					if (youtubeID !== false) {
						this.url = $(target).attr("href")
						this.youtubeID = youtubeID
						this.ui.imgPreview.hide()
						this.ui.youtubeEmbed.html(this.buildYoutubeEmbed())

					} else {
						this.youtubeID = false
						this.ui.imgPreview.show()
						this.ui.youtubeEmbed.html('')
						this.ui.imgPreview.attr('href', this.url)
						//this.$('.imgPreview img').attr('src', this.url)
						this.loadImg()
					}
					this.ui.ahrefDescription.attr('href', this.url)
					this.ui.ahrefDescription.html(this.ahrefDescription)

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
	});