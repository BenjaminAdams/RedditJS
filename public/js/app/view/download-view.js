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
                "change #subNameSelect": 'subNameSelectChange',
                'change #sortOrder': 'sortOrderChange',
                'change #timeFrame': 'timeFrameChange',
                'keyup #subName': "changeSubName"
            },
            ui: {
                postsCount: '#postsCount',
                pendingCount: '#pendingCount',
                successCount: '#successCount',
                errorCount: '#errorCount',
                nonImgCount: '#nonImgCount',
                subName: '#subName',
                startDownload: '#startDownload',
                timeFrame: '#timeFrame',
                statusBox: '#statusBox',
                sortOrder: '#sortOrder',
                subNameSelect: '#subNameSelect',
                collectionLength: '#collectionLength'

            },
            initialize: function(options) {
                _.bindAll(this);
                this.model = new Backbone.Model()
                this.model.set('subName', options.subName)
                this.manifest = '' // for keeping a detailed record of the images downloaded
                this.running = false
                this.postCount = 100
                this.activeDownloads = 0 //we want to limit how many images we try and download at once
                this.downloadLimit = 14 //how many imgs we want to download at once
                this.sortOrder = 'hot'
                this.timeFrame = 'month'
                this.totalImagesFound = 0
                this.totalNonImagesFound = 0

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
                $('.side').hide()
                this.loadSubreddits()
            },
            resetScreen: function() {
                this.zip = null
                this.manifest = ''
                this.activeDownloads = 0
                this.totalImagesFound = 0
                this.totalNonImagesFound = 0
                this.running = false
                this.ui.startDownload.html('Start')
                this.ui.pendingCount.html('0')
                this.ui.successCount.html('0')
                this.ui.errorCount.html('0')
                this.ui.postsCount.html('0')
                this.ui.nonImgCount.html('0')
                this.ui.statusBox.html(" ")

                this.ui.subName.prop('disabled', false).removeClass('disabledInput')
                this.ui.subNameSelect.prop('disabled', false).removeClass('disabledInput')
                this.ui.collectionLength.prop('disabled', false).removeClass('disabledInput')
                this.ui.timeFrame.prop('disabled', false).removeClass('disabledInput')
                this.ui.sortOrder.prop('disabled', false).removeClass('disabledInput')
            },
            fetchAllPosts: function() {
                if (this.running === false) {
                    this.running = true
                    this.resetScreen()

                    this.ui.subName.prop('disabled', true).addClass('disabledInput')
                    this.ui.subNameSelect.prop('disabled', true).addClass('disabledInput')
                    this.ui.collectionLength.prop('disabled', true).addClass('disabledInput')
                    this.ui.timeFrame.prop('disabled', true).addClass('disabledInput')
                    this.ui.sortOrder.prop('disabled', true).addClass('disabledInput')

                    this.ui.statusBox.html('Fetching data from reddit')
                    this.ui.startDownload.html('<img src="/img/loadingH.gif" />')
                    var subName = this.ui.subName.val().trim()
                    this.collection = new SubredditCollection([], {
                        domain: null,
                        subName: subName,
                        sortOrder: this.sortOrder,
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

                if (this.totalImagesFound === 0) {
                    this.resetScreen()
                    this.ui.statusBox.html("No images found")
                } else {

                    console.log('starting to make zip now')
                    this.ui.statusBox.html('Your browser will freeze while the zip is being compressed.')

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
                            self.resetScreen()
                            self.ui.statusBox.html("Done")
                        } catch (e) {
                            console.log("error:" + e)
                            self.resetScreen()
                            self.ui.statusBox.html("error:" + e)
                        }

                    }, 50)
                }

            },
            combPosts: function() {
                var self = this

                if (this.activeDownloads < this.downloadLimit) {
                    var fetchThesePosts = this.collection.where({
                        done: false,
                        startedDL: false
                    })

                    _.each(fetchThesePosts, function(model) {
                        //this.collection.each(function(model) {
                        if (self.activeDownloads < self.downloadLimit) {
                            model.set('startedDL', true)
                            if (model.get('imgUrl')) {
                                self.activeDownloads++;
                                self.addImgToZip(model)
                            } else {
                                //add post to non img post counter
                                self.totalNonImagesFound++;
                                self.manifest += "NOT IMG " + model.get('name') + " " + model.get('permalink') + "\n"
                                self.ui.pendingCount.html(parseInt(self.ui.pendingCount.html(), 10) - 1)
                                self.ui.nonImgCount.html(parseInt(self.ui.nonImgCount.html(), 10) + 1)
                                model.set('done', true)
                            }
                        }

                    })

                    if (this.totalNonImagesFound === this.collection.length) {
                        this.endZip() // this is to detect if this subreddit has zero images and display a msg to the user
                    }

                }

            },

            addImgToZip: function(model) {

                var self = this
                var imgUrl = model.get('imgUrl')
                var ext = self.getFileExtension(imgUrl)

                var xhr = new XMLHttpRequest();
                xhr.open('GET', imgUrl, true);
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
                xhr.responseType = 'arraybuffer';
                //xhr.withCredentials = false;
                //xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest")
                //xhr.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2001 00:00:00 GMT");

                xhr.onerror = function(e) {
                    self.activeDownloads--;
                    self.ui.errorCount.html(parseInt(self.ui.errorCount.html(), 10) + 1)
                    self.ui.pendingCount.html(parseInt(self.ui.pendingCount.html(), 10) - 1)
                    self.manifest += "FAILED:  *CORS prevented from downloading* " + model.get('name') + " " + model.get('imgUrl') + " http://redditjs.com" + model.get('permalink') + "\n"
                    model.set('done', true)
                    self.checkIfDone()

                }

                xhr.onabort = xhr.onerror

                xhr.onload = function(e) {

                    if (this.status == 200) {
                        var ext;
                        self.totalImagesFound++;
                        var arrayBuffer = xhr.response;
                        if (arrayBuffer) {
                            //var binary = ''
                            //var byteArray = new Uint8Array(arrayBuffer); 
                            //for (var i = 0; i < byteArray.byteLength; i++) {
                            //binary += String.fromCharCode(byteArray[i])
                            //}

                            try { //putting in try/catch because not all browsers support this
                                var bufferInt = new Uint8Array(arrayBuffer)
                                switch (bufferInt[0]) {
                                    case 255:
                                        ext = ".jpg";
                                        break;
                                    case 71:
                                        ext = ".gif";
                                        break;
                                    case 137:
                                        ext = ".png";
                                        break;
                                    case -520103681:
                                        ext = "image/jpg";
                                        break;
                                    default:
                                        ext = self.getFileExtension(imgUrl)
                                        break;
                                }
                            } catch (detectImageTypeError) {
                                ext = self.getFileExtension(imgUrl)
                            }

                            var fileName = model.get('permalink')
                            var split = fileName.split('/')
                            fileName = split[split.length - 3] + "_" + split[split.length - 2] + "_" + split[split.length - 1]
                            fileName = fileName.replace(/\//g, "_") + ext
                            self.imgFolder.file(fileName, arrayBuffer, {
                                base64: false,
                                binary: false
                            });
                            self.manifest += "SUCCESS " + model.get('name') + " " + model.get('imgUrl') + " " + model.get('permalink') + "\n"
                            self.ui.successCount.html(parseInt(self.ui.successCount.html(), 10) + 1)
                            self.ui.pendingCount.html(parseInt(self.ui.pendingCount.html(), 10) - 1)
                            model.set('done', true)

                            self.activeDownloads--;
                            self.checkIfDone()

                        } else {
                            xhr.onerror() //force error
                        }
                    }

                }

                xhr.send();

            },

            checkIfDone: function() {
                var self = this
                var isDone = true
                if (this.activeDownloads < this.downloadLimit) {
                    this.collection.each(function(model) {
                        //check if each model is marked done
                        if (model.get('done') !== true) {
                            isDone = false
                        }

                    })

                    if (isDone === true && this.activeDownloads <= 0) {
                        this.endZip()
                    } else {
                        this.combPosts()
                    }
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

            getFileExtension: function(fname) {
                var ext = fname.substr((Math.max(0, fname.lastIndexOf(".")) || Infinity) + 1);
                if (!ext || ext === "" || typeof ext === 'undefined') {
                    return '.gif'
                } else {
                    return "." + ext
                }

            },

            changeLength: function(e) {
                var target = $(e.currentTarget)
                this.postCount = parseInt(target.val(), 10)
            },
            changeSubName: function(e) {
                var target = $(e.currentTarget)
                this.model.set('subName', this.ui.subName.val())
            },
            subNameSelectChange: function(e) {
                var target = $(e.currentTarget)
                console.log(target.val())
                this.ui.subName.val(target.val())
                this.model.set('subName', target.val())
                target.val('')
            },
            sortOrderChange: function(e) {
                var target = $(e.currentTarget)
                var val = target.val()
                console.log(val)
                this.sortOrder = val
                if (val === 'top' || val === 'controversial') {
                    this.ui.timeFrame.show()
                } else {
                    this.ui.timeFrame.hide()
                }
            },
            timeFrameChange: function(e) {
                var target = $(e.currentTarget)
                console.log(target.val())
                this.timeFrame = target.val()
            },
            loadSubreddits: function() {
                var self = this
                this.ui.subNameSelect.append('<option selected="selected">-</option>')
                App.subreddits.mine.each(function(model) {
                    if (model.get('display_name') != "announcements" && model.get('display_name') != "blog") {
                        self.ui.subNameSelect.append('<option>' + model.get('display_name') + ' </option>')
                    }
                })
            },

            fetchMore: function() {
                var self = this
                //$(this.el).append("<div class='loading'> </div>")
                this.loading = true
                clearTimeout(this.jsonpTimer);

                if (this.collection.after == "stop" || this.collection.length >= this.postCount) {
                    this.ui.statusBox.html('Downloading images')
                    this.ui.postsCount.html(this.collection.length)
                    this.ui.pendingCount.html(this.collection.length)
                    this.startZip()
                    this.combPosts()
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

                    this.jsonpTimer = setTimeout(function() {
                        self.resetScreen()
                        self.ui.statusBox.html('Error fetching data from subreddit')
                    }, 10000); // we will wait at least 10 seconds for reddit to respond

                }
            }

        });
    });