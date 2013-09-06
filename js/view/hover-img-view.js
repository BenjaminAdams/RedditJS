define(['underscore', 'backbone', 'resthub', 'hbs!template/hover-img'],
	function(_, Backbone, Resthub, HoverImgTemplate) {
		var HoverImgView = Resthub.View.extend({
			strategy: 'append',
			template: HoverImgTemplate,
			//tagName: 'span',
			//className: 'hoverImgView',
			events: {
				'click .close': "closeImg", //closes the image out of the comment area
			},

			initialize: function(options) {
				_.bindAll(this);
				var self = this;
				this.url = options.url
				this.ahrefDescription = options.ahrefDescription
				this.originalText = options.originalText
				if (this.originalText == this.ahrefDescription) {
					this.originalText = '' //no point in showing the same string twice
				}
				this.model = new Backbone.Model({
					url: this.url,
					ahrefDescription: this.ahrefDescription,
					originalText: this.originalText
				})
				console.log('this.model=', this.model)

				this.render();
				this.$el.removeClass('outBoundLink')

			},
			closeImg: function() {
				this.remove()
			},
			render: function() {

			}

		});
		return HoverImgView;
	});