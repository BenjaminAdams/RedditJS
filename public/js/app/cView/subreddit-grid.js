define(['App', 'marionette', 'view/post-row-grid-view'],
    function(App, Marionette, PostRowGridView) {
        return Backbone.Marionette.CollectionView.extend({
            itemView: PostRowGridView,
            initialize: function(options) {
                var self = this
                //this.on("render", function() {
                // self.gridViewSetup()
                // console.log("the collection view is about to be rendered");
                //});

            },
            onRender: function() {
                // this.gridViewSetup()
            },
            onBeforeRender: function() {
                this.gridViewSetup()
            },
            gridViewSetup: function() {
                var self = this

                $('.side').hide()
                this.$el.css('margin-right', '0') //some custom CSS was making this bad in grid mode
                this.$el.css('text-align', 'center')
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
                    self.$el.append('<div class="column"> </div>')
                }

            }

        });
    });