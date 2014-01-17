/* download-view.js View

Downloads all of the images from this subreddit

*/
define(['App', 'underscore', 'backbone', 'jszip', 'fileSaver', 'hbs!template/download', 'view/basem-view', 'collection/subreddit'],
    function(App, _, Backbone, JSZip, fileSaver, DownloadTmpl, BaseView, SubredditCollection) {
        return BaseView.extend({
            template: DownloadTmpl,
            className: 'fullBackground',
            events: {
                'click #startDownload': "fetchAllPosts",
                'change input': 'updateSettings',
                "change select": "updateSettings"
            },
            ui: {
                postsCount: '#postsCount',
                numberofSrsInMemory: '#numberofSrsInMemory',
                displayAllSRS: '#displayAllSRS',
                subName: '#subName',
                zipBlob: '#zipBlob'
            },
            initialize: function(options) {
                _.bindAll(this);
                this.model = new Backbone.Model()
                this.model.set('subName', options.subName)
                this.manifest = '' // for keeping a detailed record of the images downloaded
                this.count = 0
                try {
                    var isFileSaverSupported = !! new Blob();
                    console.log('yay')
                } catch (e) {
                    console.log('not supported', e)
                }

            },
            onRender: function() {

            },
            fetchAllPosts: function() {
                var subName = this.ui.subName.val().trim()
                this.collection = new SubredditCollection([], {
                    domain: null,
                    subName: subName,
                    sortOrder: 'hot',
                    timeFrame: null,
                    forceJSONP: true
                });
                this.fetchMore()
            },
            startZip: function() {
                this.zip = new JSZip();
                this.imgFolder = this.zip.folder(this.model.get('subName'));
            },
            endZip: function() {
                var self = this
                console.log('starting to make zip now')
                // this.zip.file("manifest.txt", "Hello World\n");
                //var content = this.zip.generate();
                try {

                    // var blob = window.URL.createObjectURL(this.zip.generate({
                    //     type: "blob"
                    // }));
                    //var blob = window.URL.createObjectURL("data:application/zip;base64," + this.zip.generate());
                    //var blob = "data:application/zip;base64," + this.zip.generate();
                    var blob = new Blob([this.zip.generate({
                        type: 'blob'
                    })], {
                        type: "application/zip;base64"
                    });
                    //blob = new Blob([blob])
                    //  saveAs(blob, "testxx.zip");

                    var fileSaver = window.saveAs(blob, "testasdasd.zip");
                    //fileSaver.onwriteend = myOnWriteEnd;
                    self.ui.zipBlob.show()
                } catch (e) {
                    console.log("error:" + e)
                    //blobLink.innerHTML += " (not supported on this browser)";
                }
                // location.href = "data:application/zip;base64," + content;
                //window.location = "data:application/zip;base64," + content;
                //console.log('zip should have downloaded')
            },
            generateZip: function() {
                var self = this
                this.startZip()

                this.collection.each(function(model) {

                    if (model.get('imgUrl')) {
                        self.addImgToZip(model)
                    } else {
                        //add post to non img post counter
                        //self.manifest += "\n"
                        model.set('done', true)
                    }

                })

            },
            addImgToZip: function(post) {

                var self = this
                var imgUrl = post.get('imgUrl')
                this.convertImgToBase64(imgUrl, 'image/png', function(imgData) {
                    imgData = imgData.replace(/^data:image\/(png|jpg|jpeg|gif);base64,/, "");
                    self.imgFolder.file(post.get('id') + '.png', imgData, {
                        base64: true
                    });

                    post.set('done', true)
                    self.checkIfDone()
                }, function(str) {
                    post.set('done', true)
                    console.log(str)
                    self.checkIfDone()
                });

                //$.ajax({
                //url: imgUrl,
                //success: function(imgData) {
                //self.imgFolder.file(post.get('id') + '.png', imgData, {
                //base64: false,
                //binary: true
                //});
                //post.set('done', true)
                //self.checkIfDone()
                //},
                //error: function() {
                //post.set('done', true)
                //self.checkIfDone()
                //}
                //});

            },

            checkIfDone: function() {
                var self = this

                var isDone = true
                this.collection.each(function(model) {
                    //check if each model is marked done
                    if (model.get('done') !== true) {
                        isDone = false
                    }

                })

                if (isDone === true) {
                    this.endZip()
                }

            },

            convertImgToBase64: function(url, outputFormat, callback, errorCallback) {
                var canvas = document.createElement('CANVAS');
                var ctx = canvas.getContext('2d');
                var img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = function() {
                    console.log('img loaded')
                    canvas.height = img.height;
                    canvas.width = img.width;
                    ctx.drawImage(img, 0, 0);
                    //var dataURL = canvas.toDataURL(outputFormat || 'image/png');
                    var dataURL = canvas.toDataURL(outputFormat);
                    callback.call(this, dataURL);
                    // Clean up
                    canvas = null;
                };
                img.onerror = function() {
                    errorCallback('error fetching image')
                }
                img.src = url;
            },

            fetchMore: function() {

                //$(this.el).append("<div class='loading'> </div>")
                this.loading = true

                if (this.collection.after == "stop" || this.collection.length > 5) {
                    this.ui.postsCount.html(this.collection.length + ' posts loaded')
                    this.generateZip()
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