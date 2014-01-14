define(['App', 'marionette', 'view/post-row-grid-view'],
    function(App, Marionette, PostRowGridView) {
        return Backbone.Marionette.CollectionView.extend({
            itemView: PostRowGridView,
            id: 'colContainer',
            initialize: function(options) {
                var self = this
                // this.on("collection:before:render", function() {
                //     self.gridViewSetup()
                //     console.log("the collection view is about to be rendered");
                // });
                App.gridImagesLoadingCount = 0 //keeps track of how many images we load at once

            },
            onRender: function() {
                this.gridViewSetup()
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