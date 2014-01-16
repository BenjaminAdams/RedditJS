/* download-view.js View

Downloads all of the images from this subreddit

*/
define(['App', 'underscore', 'backbone', 'jszip', 'hbs!template/download', 'view/basem-view', 'collection/subreddit'],
    function(App, _, Backbone, jszip, DownloadTmpl, BaseView, SubredditCollection) {
        return BaseView.extend({
            template: DownloadTmpl,
            events: {
                'click #startDownload': "startDownload",
                'change input': 'updateSettings',
                "change select": "updateSettings"
            },
            ui: {
                postsCount: '#postsCount',
                numberofSrsInMemory: '#numberofSrsInMemory',
                displayAllSRS: '#displayAllSRS'
            },
            initialize: function(options) {
                _.bindAll(this);
                this.model = new Backbone.Model()
                this.model.set('subName', options.subName)

            },
            onRender: function() {

            },
            startDownload: function() {
                this.collection = new SubredditCollection([], {
                    domain: null,
                    subName: 'funny',
                    sortOrder: 'hot',
                    timeFrame: null,
                    forceJSONP: true
                });
                this.fetchMore()
            },

            generateZip: function() {
                //start zip file
                //get all image URLS
                //put images in zip
                //send zip to user
            },
            fetchMore: function() {

                //$(this.el).append("<div class='loading'> </div>")
                this.loading = true

                if (this.collection.after == "stop") {
                    this.ui.postsCount.html(this.collection.length + ' posts loaded')
                } else {
                    this.ui.postsCount.html(this.collection.length + ' posts loaded')
                    this.collection.fetch({
                        success: this.fetchMore,
                        error: function(data, x, y) {
                            console.log('error getting test SR', data, x, y)
                        },
                        remove: false
                    });
                }
            }

        });
    });