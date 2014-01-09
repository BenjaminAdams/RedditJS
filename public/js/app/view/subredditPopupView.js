define(['App', 'view/basem-view', 'hbs!template/subredditPopup', 'view/post-row-view'],
    function(App, BaseView, subredditPopup, PostRowView) {
        return BaseView.extend({
            template: subredditPopup,
            events: {
                'click .closepopupSiteTable': 'close',
                'click .blackOverlay': 'clickBackground'
            },
            ui: {
                popupSiteTable: '#popupSiteTable',
                blackOverlay: '.blackOverlay'
            },
            regions: {
                'popupSiteTable': '#popupSiteTable'
            },
            initialize: function(options) {
                _.bindAll(this);
                console.log(options)
                this.collection = options.collection

                this.CollectionView = new Marionette.CollectionView({
                    collection: this.collection,
                    itemView: PostRowView
                })

            },
            onRender: function() {
                this.ui.popupSiteTable.slideDown()
                this.ui.blackOverlay.show()
                this.popupSiteTable.show(this.CollectionView)
            },
            onBeforeClose: function() {
                this.ui.popupSiteTable.slideUp()
                this.ui.blackOverlay.hide()
            },
            clickBackground: function(e) {
                this.close()
            }

        });

    });