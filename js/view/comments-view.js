define([
  'underscore', 'backbone', 'resthub', 'hbs!template/comments', 'view/comment-view', 'view/base-view', 'model/comment', 'event/channel', 'cookie'],
	function(_, Backbone, Resthub, commentsTmpl, CommentView, BaseView, CommentModel, channel, Cookie) {
		var CommentsView = BaseView.extend({

			template: commentsTmpl,

			events: function() {
				var _events = {
					//'click .noncollapsed .expand': "hideThread",
					//'click .collapsed .expand': "showThread"
				};
				//console.log('click .upArrow' + this.options.id)
				_events['click .upArrow' + this.options.id] = "upvote";
				console.log('NAME IN EVENTS', this.options.model.get('name'))
				_events['submit #comment' + this.options.model.get('name')] = "comment";
				//_events['click .comment' + this.options.name] = "comment";
				_events['click .MOAR' + this.options.id] = "loadMOAR";
				return _events;
			},

			initialize: function(options) {
				_.bindAll(this);
				$(this.el).html('')
				var self = this;
				this.collection = options.collection
				this.model = options.model
				console.log('init comments view model=', this.model)
				this.template = commentsTmpl;

				this.render();

				this.renderComments(this.collection)

			},
			renderComments: function(collection) {
				//console.log(collection)
				collection.each(function(model) {
					//console.log(model.get('id'))
					var comment = new CommentView({
						model: model,
						id: model.get('id'),
						root: "#siteTableComments"
						//root: "#commentarea"
					})

				})
			},
			//callback after trying to write a comment
			commentCallback: function(data) {
				console.log('callback comment=', data)

				//post comment to have the new ID from this data 
				if (typeof data !== 'undefined' && typeof data.json !== 'undefined' && typeof data.json.data !== 'undefined' && typeof data.json.data.things !== 'undefined') {
					//status{{model.name}}
					this.$('.status' + this.model.get('name')).html('success!' + data)
					var newModel = new CommentModel(data.json.data.things[0]) //shouldn't have to input this data into the model twice
					var newData = new Array()
					newData.children = data.json.data.things
					newModel = newModel.parseComments(newData, this.model.get('name')) //get link id of the reddit post page
					newModel = newModel.at(0)
					//child{{model.name}}
					var comment = new CommentView({
						model: newModel,
						id: newModel.get('id'),
						root: ".child" + this.model.get('name') //append this comment to the end of this at the child
					})

				} else {
					this.$('.status' + this.model.get('name')).html('error ' + data)
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
		return CommentsView;
	});