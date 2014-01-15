define(['App', 'jquery', 'underscore', 'backbone', 'view/basem-view', 'hbs!template/post-row-grid', 'hbs!template/blank'],
    function(App, $, _, Backbone, BaseView, PostRowGridTmpl, BlankTmpl) {
        return BaseView.extend({
            //template: PostRowGridTmpl,
            template: BlankTmpl, //we generate the html for this view after we have the image loaded
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
                this.viewClosed = false //need a way to prevent the image to preload if the view is closed
                this.attempts = 0 //how many times we attempt to render the view
                this.allowedToRender = false
                if (this.biggerImg) { //don't preload/check for loading if the grid block does not have an img
                    this.preloadImg()

                }

            },
            render: function() {
                var self = this

                if (!this.biggerImg || !this.allowedToRender || this.viewClosed === true) {
                    console.log('not rendering this')
                    return false //so we dont render non image posts
                }
                //console.log('rendering grid block')
                var newPost = $(PostRowGridTmpl({
                    model: this.model.attributes
                }))

                if (this.biggerImg.split('.').pop() == 'gif') {
                    newPost.find('.gridLoading').show()
                    //newPost.find('.gridLoading').show() //only show loading icon if its a gif
                }

                if (this.smallerImg !== false) { //only need to hover over img when we have bigger img available
                    newPost.one("mouseenter", function() {
                        console.log("Loading bigger IMG");

                        if (self.biggerImg.split('.').pop() == 'gif') {
                            newPost.find('.gridLoading').attr('src', '/img/loading.gif')
                            //newPost.find('.gridLoading').show() //only show loading icon if its a gif
                        }

                        $('<img src="' + self.biggerImg + '" />').load(function() {
                            console.log('loaded img')
                            newPost.find('img').attr('src', self.biggerImg);
                            newPost.find('.gridLoading').hide() //hide loading gif
                        }).error(function() {
                            console.log("ERROR loading img")
                            newPost.find('.gridLoading').hide() //hide loading gif
                            //TODO show a failed to load img
                        });

                    });
                }

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
            //onRender: function() {  //functions like onRender() wont work when we override the render() function like here
            //},
            onBeforeClose: function() {
                App.off("gridView:imageLoaded", this.preloadImg)
                this.viewClosed = true
                console.log('closed grid block')

            },
            preloadImg: function() {
                var self = this

                if (this.viewClosed === true) {
                    console.log('trying to preload a grid block that has been closed')
                    return
                }

                var imgToPreload = this.smallerImg || this.biggerImg
                if (App.gridImagesLoadingCount < 10) {
                    App.gridImagesLoadingCount++;
                    App.off("gridView:imageLoaded", this.preloadImg)

                    $('<img />').attr('src', imgToPreload).load(function(data) {
                        console.log('done preload img from ', self.model.get('subreddit'))
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

            //when the user hovers over a grid block image load the gif/bigger img from imgur
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