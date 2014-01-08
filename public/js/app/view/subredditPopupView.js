define(['App', 'view/basem-view', 'hbs!template/subredditPopup', 'view/post-row-view'],
    function(App, BaseView, subredditPopup, PostRowView) {
        return BaseView.extend({
            template: subredditPopup,
            events: {
                'click .closepopupSiteTable': 'close'
            },
            ui: {

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

                $('#popupPostList').slideDown()
                this.popupSiteTable.show(this.CollectionView)
            },
            onBeforeClose: function() {
                $('#popupPostList').slideUp()
            },

        });

    });