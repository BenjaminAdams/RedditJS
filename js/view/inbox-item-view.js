/* Inbox-view.js Collection

View mail in these formats:
unread
sent
all


*/
define(['underscore', 'backbone', 'resthub', 'hbs!template/inbox-item', 'view/base-view'],
	function(_, Backbone, Resthub, InboxItemTmpl, BaseView) {
		var InboxItemView = BaseView.extend({
			strategy: 'append',

			//el: $(".content"),
			template: InboxItemTmpl,
			events: {
				'click .noncollapsed .expand': "hideThread",
				'click .collapsed .expand': "showThread",

				'click .togglebuttonReport': "reportShow",
				'click .yesReport': "reportYes", //user clicks yes to report 
				'click .noReport': "reportShow", //user decides not to report this link/comment

				'click .togglebuttonBlock': "blockShow",
				'click .yesBlock': "blockYes", //user clicks yes to report 
				'click .noBlock': "blockShow", //user decides not to report this link/comment
				'click .new': 'markRead',
			},

			initialize: function(options) {
				_.bindAll(this);
				this.model = options.model
				this.render();
				this.selector = $('#' + this.model.get('name'))
				//this.$el = $('#' + this.model.get('name'))
				if (this.model.get('new') == true) {
					this.selector.addClass('new')
				}
				this.selector.addClass(this.model.get('evenOrOdd')) //add even or odd classes

			},
			// render: function() {
			// 	console.log('rendering', this.model)
			// 	$('#siteTable').append(InboxItemTmpl({
			// 		model: this.model.attributes
			// 	}))
			// 	//return this
			// },

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

			}, //so users can report spam
			reportShow: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('.reportOption').toggle()
			},
			reportYes: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('.reportOption').hide()
				var params = {
					id: this.model.get('name'),
					uh: $.cookie('modhash'),
				};
				console.log(params)

				this.api("/api/report", 'POST', params, function(data) {
					console.log("report done", data)

				});
			},
			blockShow: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('.blockOption').toggle()
			},
			blockYes: function(e) {
				e.preventDefault()
				e.stopPropagation()
				this.$('.blockOption').hide()
				var params = {
					id: this.model.get('name'),
					uh: $.cookie('modhash'),
				};
				console.log(params)

				this.api("/api/block", 'POST', params, function(data) {
					console.log("block done", data)

				});
			},
			markRead: function() {
				console.log('marking read')
				this.selector.removeClass('new')
				var params = {
					id: this.model.get('name'),
					uh: $.cookie('modhash'),
				};
				console.log(params)

				this.api("/api/read_message", 'POST', params, function(data) {
					console.log("msg read done", data)

				});
			}

		});
		return InboxItemView;
	});