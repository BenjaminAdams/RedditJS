define(['App', 'marionette', 'view/post-row-grid-view'],
    function(App, Marionette, PostRowGridView) {
        return Backbone.Marionette.CollectionView.extend({
            itemView: PostRowGridView,
            id: 'colContainer',
            initialize: function(options) {
                var self = this
                App.gridImagesLoadingCount = 0 //keeps track of how many images we load at once
            },
            onRender: function() {
                this.gridViewSetup()

                //test if all posts in collection are non-image posts
                this.testNonImg()
            },

            onBeforeClose: function() {
                App.off('showNonImgs')
            },

            testNonImg: function() {
                var self = this
                setTimeout(function() {
                    if (((self.collection.length - self.collection.countNonImg) < 2) && App.settings.get('hideSelf') === true) {
                        console.log('show non imgs')
                        self.noImgsFound()
                    }
                }, 5000)

            },
            //display all self posts and links if no imgs found
            noImgsFound: function() {

                $('#siteTableContainer').append('<div id="noImgsMsg"> No images found in this subreddit, change to another view. </div>');
                //App.trigger('showNonImgs')

            },
            gridViewSetup: function() {
                //calculate how many columns we will have
                var colCount = Math.floor($(document).width() / 305)
                if (App.isMobile() === true) {
                    var fakeMobileWidth = $(document).width()
                    if (fakeMobileWidth < 550) {
                        fakeMobileWidth = 550
                    }
                    colCount = Math.floor(fakeMobileWidth / 249)
                }
                for (var i = 0; i < colCount; i++) {
                    this.$el.append('<div class="column"> </div>')
                }
                $('.side').hide()
                this.$el.css('margin-right', '0') //some custom CSS was making this bad in grid mode
                this.$el.css('text-align', 'center')
            }
        });
    });