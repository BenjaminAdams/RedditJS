define(['App', 'marionette', 'view/post-row-grid-view'],
    function(App, Marionette, PostRowGridView) {
        return Backbone.Marionette.CollectionView.extend({
            itemView: PostRowGridView,
            initialize: function(options) {

            },
            onRender: function() {
                this.gridViewSetup()
            },
            gridViewSetup: function() {
                var self = this

                $('.side').hide()
                $('#siteTable').css('margin-right', '0') //some custom CSS was making this bad in grid mode
                $('#siteTable').css('text-align', 'center')
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
                    $('#siteTable').append('<div class="column"> </div>')
                }

                //this.ui.siteTable.append('<div id="fullImgCache"></div>')

            }

        });
    });