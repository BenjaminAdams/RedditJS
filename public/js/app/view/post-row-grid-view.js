define(['App', 'jquery', 'underscore', 'backbone', 'view/basem-view', 'hbs!template/post-row-grid'],
    function(App, $, _, Backbone, BaseView, PostRowGridTmpl) {
        return BaseView.extend({
            template: PostRowGridTmpl,
            events: {
                'click a': "gotoSingle",
                // 'click .upArrow': 'upvote',
                // 'click .downArrow': 'downvote',
                // 'click .save': 'savePost',
                // 'click .unsave': 'unSavePost',
                // 'click .hide': 'hidePost',
                // 'click .report': 'reportShow',
                // 'click .reportConfirmYes': 'reportYes',
                // 'click .reportConfirmNo': 'reportShow',
                // 'click .expando-button': 'toggleExpando',
                // 'click .share-button': 'toggleShare',
                // 'drag .dragImg': 'dragImg'
            },
            ui: {
                'gridLoading': '.gridLoading',
                // 'postRowContent': '.postRowContent',
                // upArrow: '.upArrow',
                // downArrow: '.downArrow',
                // midcol: '.midcol',
                // 'reportConfirm': '.reportConfirm',
                // 'reportConfirmYes': '.reportConfirmYes',
                // 'save': '.save',
                // 'unsave': '.unsave'
            },
            initialize: function(data) {
                var self = this
                //  _.bindAll(this);
                this.model = data.model;
                this.biggerImg = this.model.get('imgUrl')
                this.smallerImg = this.model.get('smallImg')

                //this.once("mouseenter", this.loadBiggerImg, this)

            },
            // render: function() {
            //     var newPost = $(PostRowGridTmpl({
            //         model: this.model
            //     }))
            //     var col = this.shortestCol()
            //     if (col) {
            //         col.append(newPost);
            //     }
            // },
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

        });
    });