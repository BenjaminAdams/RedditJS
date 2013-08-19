define(['jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/post-row', 'model/post'],
    function($, _, Backbone, Resthub, PostRowTmpl, PostModel){
        var PostRowView = Resthub.View.extend({
			strategy: 'append',
            events: {
                'click .up':  'upvote',
              //  'keyup #new-todo':     'showTooltip'
            },
            
            initialize: function(data) {
                this.model = data.model;
                this.template = PostRowTmpl;
                this.render();
                // this.$() is a shortcut for this.$el.find().
            },
			 upvote: function() {
					console.log(this.model)
			 }


        });
        return PostRowView;
    });