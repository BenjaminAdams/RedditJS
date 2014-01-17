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
                'change #collectionLength': 'changeLength',
                "change select": "updateSettings",
                'keyup #subName': "changeSubName"
            },
            ui: {
                postsCount: '#postsCount',
                pendingCount: '#pendingCount',
                successCount: '#successCount',
                errorCount: '#errorCount',
                subName: '#subName',
                startDownload: '#startDownload',
                statusBox: '#statusBox'

            },
            initialize: function(options) {
                _.bindAll(this);
                this.model = new Backbone.Model()
                this.model.set('subName', options.subName)
                this.manifest = '' // for keeping a detailed record of the images downloaded
                this.running = false
                this.postCount = 500

                //feature detection
                try {
                    var isFileSaverSupported = !! new Blob();
                } catch (e) {
                    this.ui.statusBox.html("Your browser might not be supported, trying anyway....")
                }

            },
            onBeforeClose: function() {
                $('.side').show()
            },
            onRender: function() {

            },
            resetScreen: function() {
                this.running = false
                this.ui.startDownload.html('Start')
                this.ui.pendingCount.html('0')
                this.ui.successCount.html('0')
                this.ui.errorCount.html('0')
                this.ui.postsCount.html('0')
                this.ui.statusBox.html(" ")
            },
            fetchAllPosts: function() {
                if (this.running === false) {
                    this.running = true
                    this.ui.startDownload.html('<img src="/img/loadingH.gif" />')
                    var subName = this.ui.subName.val().trim()
                    this.collection = new SubredditCollection([], {
                        domain: null,
                        subName: subName,
                        sortOrder: 'hot',
                        timeFrame: null,
                        forceJSONP: true
                    });
                    this.fetchMore()
                }
            },
            startZip: function() {
                this.zip = new JSZip();
                this.imgFolder = this.zip.folder(this.model.get('subName'));
            },
            endZip: function() {
                var self = this
                console.log('starting to make zip now')

                this.ui.statusBox.html('Your browser will freeze while the zip is being compressed.  Could take several minutes.')

                setTimeout(function() {
                    self.zip.file("manifest.txt", self.manifest);
                    //var content = this.zip.generate();
                    try {

                        var blob = new Blob([self.zip.generate({
                            type: 'blob'
                        })], {
                            type: "application/zip;base64"
                        });

                        var fileSaver = saveAs(blob, "redditjs-" + self.model.get('subName') + ".zip");
                        console.log('done making zip')
                    } catch (e) {
                        console.log("error:" + e)
                        //blobLink.innerHTML += " (not supported on this browser)";
                    }

                    self.resetScreen()
                }, 50)

            },
            generateZip: function() {
                var self = this
                this.startZip()

                this.collection.each(function(model) {

                    if (model.get('imgUrl')) {
                        self.addImgToZip(model)
                    } else {
                        //add post to non img post counter
                        self.manifest += "NOT IMG " + model.get('name') + " " + model.get('permalink') + "\n"
                        self.ui.pendingCount.html(parseInt(self.ui.pendingCount.html()) - 1)
                        model.set('done', true)
                    }

                })

            },
            addImgToZip: function(model) {

                var self = this
                var imgUrl = model.get('imgUrl')
                this.convertImgToBase64(imgUrl, 'image/png', function(imgData) {
                    imgData = imgData.replace(/^data:image\/(png|jpg|jpeg|gif);base64,/, "");
                    self.imgFolder.file(model.get('id') + '.png', imgData, {
                        base64: true
                    });
                    self.manifest += "SUCCESS " + model.get('name') + " " + model.get('imgUrl') + " " + model.get('permalink') + "\n"
                    self.ui.successCount.html(parseInt(self.ui.successCount.html()) + 1)
                    self.ui.pendingCount.html(parseInt(self.ui.pendingCount.html()) - 1)
                    model.set('done', true)
                    self.checkIfDone()
                }, function(str) {
                    model.set('done', true)
                    self.ui.errorCount.html(parseInt(self.ui.successCount.html()) + 1)
                    self.ui.pendingCount.html(parseInt(self.ui.pendingCount.html()) - 1)
                    self.manifest += "FAILED:  *" + str + "* " + model.get('name') + " " + model.get('imgUrl') + " http://redditjs.com" + model.get('permalink') + "\n"
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
            changeLength: function(e) {
                var target = $(e.currentTarget)
                this.postCount = parseInt(target.val())
            },
            changeSubName: function(e) {
                var target = $(e.currentTarget)
                this.model.set('subName', this.ui.subName.val())
            },

            fetchMore: function() {

                //$(this.el).append("<div class='loading'> </div>")
                this.loading = true

                if (this.collection.after == "stop" || this.collection.length >= this.postCount) {
                    this.ui.postsCount.html(this.collection.length)
                    this.ui.pendingCount.html(this.collection.length)
                    this.generateZip()
                } else {
                    if (this.collection.length > 0) {
                        this.ui.postsCount.html(this.collection.length)
                    }
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