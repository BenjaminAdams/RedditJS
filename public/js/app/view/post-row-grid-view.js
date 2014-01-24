define(['App', 'jquery', 'underscore', 'backbone', 'view/basem-view', 'hbs!template/post-row-grid', 'hbs!template/blank'],
    function(App, $, _, Backbone, BaseView, PostRowGridTmpl, BlankTmpl) {
        return BaseView.extend({
            //template: PostRowGridTmpl,
            template: BlankTmpl, //we generate the html for this view after we have the image loaded
            events: {
                'click a': "gotoSingle",
                'click .upArrow': 'upvote',
                'click .downArrow': 'downvote',
                'click .save': 'savePost',
                'click .unsave': 'unSavePost',
                'click .hide': 'hidePost',
                'click .report': 'reportShow',
                'click .reportConfirmYes': 'reportYes',
                'click .reportConfirmNo': 'reportShow',
                'click .share-button': 'toggleShare'
            },
            ui: {
                'gridLoading': '.gridLoading',
                'mainGridImg': '.mainGridImg',
                upArrow: '.upArrow',
                downArrow: '.downArrow',
                midcol: '.midcol',
                'flatList': '.flat-list',
                'reportConfirm': '.reportConfirm',
                'reportConfirmYes': '.reportConfirmYes',
                'save': '.save',
                'unsave': '.unsave'
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
                this.nonImg = false
                if (this.biggerImg) { //don't preload/check for loading if the grid block does not have an img
                    this.preloadImg()
                } else {
                    this.allowedToRender = true
                    this.biggerImg = ''
                    this.nonImg = true
                }

                this.setupMouseover()

            },
            render: function() {
                var self = this

                //if (!this.biggerImg || !this.allowedToRender || this.viewClosed === true) {
                if (!this.allowedToRender || this.viewClosed === true) {
                    return false //so we dont render non image posts
                }
                //console.log('rendering grid block')
                this.$el.html($(PostRowGridTmpl({
                    model: this.model.attributes
                })))

                this.$el.hide()

                if (this.biggerImg.split('.').pop() == 'gif') {
                    this.$el.find('.gridLoading').show()
                    //newPost.find('.gridLoading').show() //only show loading icon if its a gif
                }

                if (this.smallerImg !== false) { //only need to hover over img when we have bigger img available
                    this.$el.one("mouseenter", function() {
                        if (self.biggerImg.split('.').pop() == 'gif') {
                            self.ui.gridLoading.attr('src', '/img/loading.gif')
                            //newPost.find('.gridLoading').show() //only show loading icon if its a gif
                        }

                        //self.$el.find('img').attr('src', self.biggerImg);
                        //self.$el.find('.gridLoading').hide()
                        $('<img src="' + self.biggerImg + '" />').load(function() {
                            self.ui.mainGridImg.attr('src', self.biggerImg);
                            self.ui.gridLoading.hide()
                        }).error(function() {
                            console.log("ERROR loading img")
                            self.ui.gridLoading.hide() //hide loading gif
                            //TODO show a failed to load img
                        });

                    });
                }

                if (this.nonImg) {
                    setTimeout(function() {
                        self.fakeRender()
                    }, Math.floor((Math.random() * 1000) + 1))
                } else {
                    this.fakeRender()
                }

                return this

            },
            fakeRender: function() {
                this.bindUIElements();
                this.appendToShortest(this.$el)
                this.$el.show()
                if (this.nonImg === true) {
                    this.ui.mainGridImg.hide()
                }
            },
            //onRender: function() {  //functions like onRender() wont work when we override the render() function like here
            //},
            onBeforeClose: function() {
                App.off("gridView:imageLoaded", this.preloadImg)
                this.viewClosed = true

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
            },
            setupMouseover: function() {
                var self = this

                this.$el.hover(
                    function() {
                        clearInterval(this.hoverTimeout);
                        self.ui.flatList.slideDown(100)
                    }, function() {
                        this.hoverTimeout = setTimeout(function() {
                            console.log('closing')
                            self.ui.flatList.slideUp(800)
                        }, 1400)

                    }
                );

            }

        });
    });