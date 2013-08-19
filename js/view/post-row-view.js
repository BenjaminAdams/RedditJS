define(['jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/post-row', 'model/post', 'view/base-view'],
    function($, _, Backbone, Resthub, PostRowTmpl, PostModel, BaseView) {
        var PostRowView = BaseView.extend({
            strategy: 'append',
            events: {
                'click .upArrow': 'upvote',
                'click .downArrow': 'downvote',
                //  'keyup #new-todo':     'showTooltip'
            },

            initialize: function(data) {
                this.model = data.model;
                this.template = PostRowTmpl;
                this.render();
                // this.$() is a shortcut for this.$el.find().
            },
            upvote: function() {
                if (this.model.get('likes') == false || this.model.get('likes') == null) {
                    this.vote(1, this.model.get('name'))
                    this.model.set('likes', true)
                    this.model.set('downmod', 'down')
                    this.model.set('upmod', 'upmod')
                    this.$('.midcol .dislikes').hide()
                    this.$('.midcol .likes').show()
                    this.$('.midcol .unvoted').hide()

                    this.$('.upArrow').addClass('upmod')
                    this.$('.upArrow').removeClass('up')
                    this.$('.downArrow').addClass('down')
                    this.$('.downArrow').removeClass('downmod')

                } else {
                    this.cancelVote()
                }
            },
            downvote: function() {
                if (this.model.get('likes') == true || this.model.get('likes') == null) {

                    this.vote(-1, this.model.get('name'))
                    this.model.set('likes', false)
                    this.model.set('downmod', 'downmod')
                    this.model.set('upmod', 'up')

                    this.$('.midcol .dislikes').show()
                    this.$('.midcol .likes').hide()
                    this.$('.midcol .unvoted').hide()

                    this.$('.upArrow').addClass('up')
                    this.$('.upArrow').removeClass('upmod')
                    this.$('.downArrow').addClass('downmod')
                    this.$('.downArrow').removeClass('down')

                } else {
                    this.cancelVote()
                }
            },
            cancelVote: function() {
                this.vote(0, this.model.get('name'))
                this.model.set('likes', null)
                this.model.set('downmod', 'down')
                this.model.set('upmod', 'up')
                this.$('.midcol .dislikes').hide()
                this.$('.midcol .likes').hide()
                this.$('.midcol .unvoted').show()

                this.$('.upArrow').addClass('up')
                this.$('.upArrow').removeClass('upmod')
                this.$('.downArrow').addClass('down')
                this.$('.downArrow').removeClass('downmod')
            }

        });
        return PostRowView;
    });