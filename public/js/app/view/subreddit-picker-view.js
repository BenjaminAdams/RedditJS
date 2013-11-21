define(['App', 'view/basem-view', 'collection/subreddit-picker', 'hbs!template/subreddit-picker', 'view/subreddit-picker-item-view'],
    function(App, BaseView, SRPCollection, SRPTmpl, SRPItemView) {
        return BaseView.extend({
            template: SRPTmpl,
            events: {
                'submit #search': 'gotoSearch'
            },
            regions: {
                'siteTable': '#siteTable'
            },
            initialize: function(options) {
                _.bindAll(this);

                this.searchQ = decodeURIComponent(options.searchQ);

                this.model = new Backbone.Model({
                    searchQ: this.searchQ
                })

                this.collection = new SRPCollection({
                    searchQ: this.searchQ
                });
                this.fetchMore();

                $(window).on("scroll", this.watchScroll);
                App.on("subreddit:remove", this.remove, this);
                //this.target = $("#siteTable"); //the target to test for infinite scroll
                this.target = $(window); //the target to test for infinite scroll
                this.loading = false;
                this.scrollOffset = 1000;
                this.prevScrollY = 0; //makes sure you are not checking when the user scrolls upwards
                this.errorRetries = 0; //keeps track of how many errors we will retry after

                this.CollectionView = new Marionette.CollectionView({
                    collection: this.collection,
                    itemView: SRPItemView
                })

            },
            onRender: function() {
                $(this.el).append("<div class='loading'> </div>")
                //in small thumbnail mode, its sometimes impossible for the infinite scroll event to fire because there is no scrollbar yet
                this.helpFillUpScreen();
                this.siteTable.show(this.CollectionView)
            },
            onBeforeClose: function() {
                $(window).off("scroll", this.watchScroll);
                App.off("subreddit:remove", this.remove, this);
            },
            fetchMore: function() {
                this.loading = true
                this.collection.fetch({
                    success: this.gotNewPosts
                })
            },
            gotNewPosts: function(models, res) {
                this.$('.loading').hide()
                if (typeof res.data.children.length === 'undefined') {
                    return;
                }
                //fetch more  posts with the After
                if (this.collection.after == "stop") {
                    console.log("AFTER = stop")
                    $(window).off("scroll", this.watchScroll);
                }
                this.loading = false; //turn the flag on to go ahead and fetch more!
                this.helpFillUpScreen()
                //window.subs[this.subID] = this.collection

            },
            // appendPosts: function(collection) {
            //     var self = this
            //     collection.each(function(model) {
            //         var srpItem = new SRPItemView({
            //             root: "#siteTable",
            //             model: model
            //         });

            //     })

            // },

            helpFillUpScreen: function() {
                if (this.collection.length < 301 && this.gridOption == 'small') {
                    //this.watchScroll()
                }
            },
            /**************Infinite Scroll functions ****************/
            watchScroll: function(e) {
                if (window.settings.get('infin') === true) {

                    var self = this;
                    this.triggerPoint = 1500; // px from the bottom 

                    if ((($(window).scrollTop() + $(window).height()) + this.triggerPoint >= $(document).height()) && this.loading === false) {

                        console.log('loading MOAR')
                        if (this.collection.after != "stop") {
                            this.fetchMore()
                        }
                    }
                    //this.prevScrollY = scrollY;
                }
            },
            gotoSearch: function(e) {
                e.preventDefault()
                e.stopPropagation()
                var q = encodeURIComponent(this.$('#mainQ').val())
                Backbone.history.navigate('/subreddits/' + q, {
                    trigger: true
                })

            }

        });

    });