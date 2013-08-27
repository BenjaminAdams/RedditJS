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
				_events['click #report' + this.options.id] = "reportShow";
				_events['click #reportConfirmYes' + this.options.id] = "reportYes"; //user clicks yes to report 
				_events['click #reportConfirmNo' + this.options.id] = "reportShow"; //user decides not to report this link/comment

				_events['submit #comment' + this.options.model.get('name')] = "comment";
				//_events['click .comment' + this.options.name] = "comment";
				//_events['click .MOAR' + this.options.id] = "loadMOAR";
				_events['click #mdHelpShow' + this.options.model.get('id')] = "showMdHelp";
				_events['click #mdHelpHide' + this.options.model.get('id')] = "hideMdHelp";
				return _events;
			},

			initialize: function(options) {
				//console.log('comments view in it')
				_.bindAll(this);
				$(this.el).html('')
				var self = this;
				this.template = commentsTmpl;

				this.collection = options.collection
				this.render();
				this.renderComments(this.collection)
				console.log('got here')
				this.model = options.model
				//console.log('init comments view model=', this.model)

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

			/**************Fetching functions ****************/
			fetchError: function(response, error) {
				console.log("fetch error, lets retry")

			},
			fetchMore: function() {

			},

			//called when no model is passed and after the fetch happens
			loaded: function(model, res) {
				this.$('.loading').hide()

				this.render();

			},

		});
		return CommentsView;
	});