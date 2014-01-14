define(['App', 'jquery', 'underscore', 'backbone', 'view/basem-view', 'hbs!template/post-row-grid'],
    function(App, $, _, Backbone, BaseView, PostRowGridTmpl) {
        return BaseView.extend({
            template: PostRowGridTmpl,

            events: {
                'click a': "gotoSingle"
            },
            ui: {
                'gridLoading': '.gridLoading',
                'mainGridImg': '.mainGridImg'
            },
            initialize: function(data) {
                var self = this
                _.bindAll('this.preloadImg');
                this.model = data.model;
                this.biggerImg = this.model.get('imgUrl')
                this.smallerImg = this.model.get('smallImg')
                this.attempts = 0 //how many times we attempt to render the view
                if (this.biggerImg) { //don't preload/check for loading if the grid block does not have an img

                    if (this.detectIfCached(this.smallerImg)) {
                        this.allowedToRender = true
                    } else { //so dont try and preload self text posts or links
                        this.allowedToRender = false //so we only load x number of images at the same time
                        this.preloadImg()
                    }
                }
                //this.once("mouseenter", this.loadBiggerImg, this)

            },
            render: function() {
                var self = this

                if (!this.biggerImg || !this.allowedToRender) {
                    return false //so we dont render non image posts
                }
                //console.log('rendering grid block')
                var newPost = $(PostRowGridTmpl({
                    model: this.model.attributes
                }))

                //sometimes the columns are not setup yet, wait until they are
                //TODO: fix this, bad practice
                this.appendToShortest(newPost)

                //var col = this.shortestCol()  //we can't do this because if we re-render this view it treats the onRender differently and theres no columns yet
                //if (col) {
                //col.append(newPost);
                //} else {
                //console.log('no cols available')
                //}

                return this

            },
            onRender: function() {
                if (this.smallerImg) {
                    console.log('setting up event')
                    //only load scroll over event if user is in grid mode and that grid mode has a smaller imgur img displaying
                    //this is so the user can hover over the post and load the full size img/full gif
                    if (this.biggerImg.split('.').pop() == 'gif') {
                        this.ui.gridLoading.show()
                        //newPost.find('.gridLoading').show() //only show loading icon if its a gif
                    }

                }
            },
            onBeforeClose: function() {
                App.off("gridView:imageLoaded");

            },
            preloadImg: function() {
                var self = this
                if (App.gridImagesLoadingCount < 10 && this.allowedToRender === false) {
                    App.gridImagesLoadingCount++;
                    this.imgLoad = $('<img />').attr('src', this.smallerImg).load(function(data) {
                        self.allowedToRender = true
                        self.render()
                        App.gridImagesLoadingCount--;
                        App.trigger("gridView:imageLoaded")
                    }).error(function() {
                        App.gridImagesLoadingCount--;
                    })

                } else if (this.allowedToRender === false) {
                    App.once("gridView:imageLoaded", this.preloadImg, this);
                }
            },
            loadBiggerImg: function() {
                var self = this

                console.log("Loading bigger IMG");
                if (biggerImg.split('.').pop() == 'gif') {
                    self.ui.gridLoading.attr('src', '/img/loading.gif')
                    //newPost.find('.gridLoading').show() //only show loading icon if its a gif
                }

                $('<img src="' + biggerImg + '" />').load(function() {
                    console.log('loaded img')
                    self.find('img').attr('src', biggerImg);
                    self.find('.gridLoading').hide() //hide loading gif
                }).error(function() {
                    console.log("ERROR loading img")
                    self.find('.gridLoading').hide() //hide loading gif
                    //TODO show a failed to load img
                });

            },
            detectIfCached: function(url) {
                var testImg = document.createElement("img");
                testImg.src = url;
                return testImg.complete || testImg.width + testImg.height > 0;

            },

            //puts the model in a temporary space to pass it to the single page so it loads instantly
            gotoSingle: function(e) {
                var self = this

                var target = $(e.currentTarget)
                var permalink = this.model.get('permalink')
                var targetLink = target.attr('href')
                if (permalink == targetLink) {
                    // console.log('it worked', this.model)
                    //I've made the choice here to pass the current model as a global so we do not have to have a long load time
                    //the single post page takes 2-3 seconds to load the get request
                    setTimeout(function() {
                        App.curModel = self.model //the small view closes too fast and is unable to pass the model to the single
                    }, 5)
                    App.curModel = this.model
                }

            },

            shortestCol: function() {
                var shortest = null
                var count = 0
                $('.column').each(function() {
                    if (shortest === null) {
                        shortest = $(this)
                    } else if ($(this).height() < shortest.height()) {
                        //console.log($(this).height(), shortest.height())
                        shortest = $(this)
                    }
                });
                return shortest;
            },
            appendToShortest: function(newPost) {
                var self = this
                var col = this.shortestCol()
                if (col) {
                    col.append(newPost);
                } else {
                    if (this.attempts < 5) { //prevents infinte loop
                        this.attempts++;
                        setTimeout(function() {
                            self.appendToShortest(newPost)
                        }, 5)
                    }
                }
            }

        });
    });