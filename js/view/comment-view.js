define([
  'underscore', 'backbone', 'resthub', 'hbs!template/comment', 'hbs!template/commentMOAR', 'view/base-view', 'model/comment', 'event/channel', 'cookie'],
	function(_, Backbone, Resthub, commentTmpl, CommentMOAR, BaseView, CommentModel, channel, Cookie) {
		var CommentView = BaseView.extend({
			strategy: 'append',

			events: function() {
				var _events = {
					'click .noncollapsed .expand': "hideThread",
					'click .collapsed .expand': "showThread"
				};
				//console.log('click .upArrow' + this.options.id)
				_events['click .upArrow' + this.options.id] = "upvote";
				_events['click .downArrow' + this.options.id] = "downvote";
				_events['click .MOAR' + this.options.id] = "loadMOAR";
				return _events;
			},

			// events: {
			// 	'click .downArrow': 'downvote',
			// 'click .noncollapsed .expand': "hideThread",
			// 'click .collapsed .expand': "showThread"
			// 	//  'keyup #new-todo':     'showTooltip'
			// },

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

				this.renderChildren(this.model.get('replies'))

				// this.model.fetch({
				// 	success: this.loaded,
				// 	error: this.fetchError
				// });
			},
			loadMOAR: function(e) {
				e.preventDefault()
				e.stopPropagation()
				var self = this
				console.log('loading MOAR')
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

				this.api("api/morechildren.json", 'POST', params, function(data) {
					console.log("MOAR done", data)
					//this is an awful hack....
					data.children = data.json.data.things
					var tmpModel = new CommentModel()
					var newComments = tmpModel.parseComments(data, link_id)
					self.reRenderMOAR(newComments)

				});
			},
			reRenderMOAR: function(newComments) {
				if (typeof newComments !== 'undefined' && newComments.length > 0) {
					//pluck the first model in the collection and set it as this model for reRendering
					this.model = newComments.at(0)
					var newComments = newComments.slice(1, newComments.length)
					newComments = new Backbone.Collection(newComments)

					this.model.set('replies', newComments)
					//change template back to normal comment template
					this.template = commentTmpl
					this.render()
					this.renderChildren(this.model.get('replies'))

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

			renderChildren: function(replies) {
				//var replies = this.model.get('replies')
				if (typeof replies !== 'undefined' && replies != "" && replies != null) {
					var self = this
					console.log(replies)

					replies.each(function(model) {
						var comment = new CommentView({
							model: model,
							id: model.get('id'),
							root: "#" + self.name
						})

					})

				}
			},
			/**************Fetching functions ****************/
			fetchError: function(response, error) {
				console.log("fetch error, lets retry")

			},
			fetchMore: function() {

			},

			loaded: function(model, res) {
				this.$('.loading').hide()

				this.render();

			},

		});
		return CommentView;
	});