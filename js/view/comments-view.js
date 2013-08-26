define([
  'underscore', 'backbone', 'resthub', 'hbs!template/comments', 'view/comment-view', 'view/base-view', 'collection/comments', 'model/comment', 'event/channel', 'cookie'],
	function(_, Backbone, Resthub, commentsTmpl, CommentView, BaseView, CommentCollection, CommentModel, channel, Cookie) {
		var CommentsView = BaseView.extend({

			template: commentsTmpl,

			events: function() {
				var _events = {
					//'click .noncollapsed .expand': "hideThread",
					//'click .collapsed .expand': "showThread"
				};
				//console.log('click .upArrow' + this.options.id)
				_events['click .upArrow' + this.options.id] = "upvote";
				_events['submit #comment' + this.options.model.get('name')] = "comment";
				//_events['click .comment' + this.options.name] = "comment";
				_events['click .MOAR' + this.options.id] = "loadMOAR";
				return _events;
			},

			initialize: function(options) {
				//console.log('comments view in it')
				_.bindAll(this);
				$(this.el).html('')
				var self = this;
				this.collection = options.collection
				this.model = options.model
				//console.log('init comments view model=', this.model)
				this.template = commentsTmpl;

				this.render();

				this.renderComments(this.collection)

			},
			renderComments: function(collection) {
				//console.log('collection in renderComments', collection)
				collection.each(function(model) {
					//console.log('model in renderComments', model)
					var comment = new CommentView({
						model: model,
						id: model.get('id'),
						strategy: "append",
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
					this.$('.status' + this.model.get('name')).html('<span class="success">success!</span>')
					//data.json.data.things[0].data.link_id = this.model.get('name')
					var attributes = data.json.data.things[0].data
					attributes.author = $.cookie('username');

					//this if statement will only fire during a comment callback
					attributes.body_html = attributes.contentHTML
					attributes.name = attributes.id
					attributes.link_id = attributes.link
					attributes.likes = true
					attributes.subreddit = this.model.get('subreddit')
					attributes.smallid = attributes.id.replace('t1_', '')
					attributes.permalink = '/r/' + data.subreddit + '/comments/' + attributes.link_id + "#" + data.id

					//clear the users text
					this.$('#text' + attributes.link_id).val("")

					var newModel = new CommentModel(attributes) //shouldn't have to input this data into the model twice

					//child{{model.name}}
					var comment = new CommentView({
						model: newModel,
						id: newModel.get('id'),
						strategy: "prepend",
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