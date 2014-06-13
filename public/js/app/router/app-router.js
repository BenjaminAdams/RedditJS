define(['App', 'underscore', 'backbone', 'marionette', 'view/header-view', 'view/sidebar-view', 'collection/my-subreddits', 'model/sidebar', 'event/channel', 'view/mobile-header'],
    function(App, _, Backbone, Marionette, HeaderView, SidebarView, MySubredditsCollection, SidebarModel, channel, MobileHeaderView) {
        var AppRouter = Backbone.Marionette.AppRouter.extend({
            initialize: function(options) {
                //load settings
                App.settings = new Backbone.Model()
                this.loadSettingsFromCookies()
                this.checkIfNightmode();

                App.subreddits = {}
                App.subreddits.mine = new MySubredditsCollection()
                //caching subreddit json in a global because it takes about 3 seconds to query from reddit api
                App.subs = []

                //so you can link users to a subreddit with a particular view.  Ex:  http://redditjs.com/r/aww#grid
                if (window.location.hash) {
                    var hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
                    if (hash === 'grid' || hash === 'small' || hash === 'large' || hash === 'normal') {
                        App.settings.set('gridOption', hash)
                        //$.cookie('gridOption', hash, {
                        // path: '/'
                        //});
                    }
                }

                this.currentHeader = null

                this.initHeader()

            },
            routes: {
                //ex http://redditjs.com/embed/url=http://dudelol.com/now-that-youre-big-dr-suess-style-sex-ed-book&as=4&fffff=123
                'embed?*q': 'embed',
                'r/myrandom(/)': 'myrandom',
                'r/:subName/submit(/)': 'submit',
                'submit(/)': 'submit',
                'submit/*q': 'submitWithUrl',
                'prefs(/)': 'prefs',
                'test(/)': 'test',
                'redirectBack(/)': 'redirectBack',
                'subreddits(/)': 'subreddits',
                'subreddits(/):q': 'subreddits',
                '(:sortOrder)(/)': 'home',

                'r/:subName(/)': 'subreddit',
                'r/:subName?mode=:mode': 'subreddit',
                'r/:subName/:sortOrder(/)': 'subreddit',
                'r/:subName/:sortOrder/:timeFrame': 'subreddit',
                'r/:subName/:sortOrder/:timeFrame?mode=:mode': 'subreddit',

                'domain/:domain(/)': 'subredditDomain',
                'domain/:domain/:sortOrder(/)': 'subredditDomain',
                'domain/:domain/:sortOrder/:timeFrame(/)': 'subredditDomain',
                'domain/:domain/:sortOrder/:timeFrame?opts:opts': 'subredditDomain',

                'r/:subName/comments/:id(/)': 'single',
                'r/:subName/comments/:id/:slug(/)': 'single',
                'r/:subName/comments/:id/:slug/:commentLink(/)': 'single',

                'u/:username(/)': 'user',
                'user/:username(/)': 'user',
                'user/:username/:sortOrder(/)': 'user',

                'message/compose/:username(/)': 'compose',
                'message/:type(/)': 'inbox',
                'download(/)': 'download',
                'download/:subName(/)': 'download',

                'search': 'search',
                'search/:q(/)': 'search',
                'search/:q/:timeFrame(/)': 'search',
                'search/:q/:timeFrame/:sortOrder(/)': 'search'

            },
            //we override the route function 
            //middleware, this will be fired before every route
            route: function(route, name, callback) {
                var router = this;
                if (!callback) callback = this[name];
                var f = function() {

                    //middleware functions, functions that get called between every route
                    if (name != 'single') { //hide the bottom bar if not in single view
                        App.bottombarRegion.close()
                    }

                    if (typeof ga === 'function') {
                        var path = Backbone.history.getFragment();
                        ga('send', 'pageview', {
                            page: "/" + path
                        });

                    }

                    //end middleware functions
                    callback.apply(router, arguments); //call the actual route
                };
                return Backbone.Router.prototype.route.call(this, route, name, f);
            },
            home: function(sortOrder) {

                // channel.trigger("header:updateSortOrder")
                if (App.subs.length > 1) {
                    App.stop()
                }
                this.doSidebar('front');
                require(['view/subreddit-view'], function(SubredditView) {

                    App.mainRegion.show(new SubredditView({
                        subName: 'front',
                        sortOrder: sortOrder || 'hot'
                    }));
                })
            },

            subreddit: function(subName, sortOrder, timeFrame, mode) {
                if (App.subs.length > 1) {
                    App.stop()
                }

                console.log('mode=', mode)
                this.doSidebar(subName);
                require(['view/subreddit-view'], function(SubredditView) {
                    App.mainRegion.show(new SubredditView({
                        subName: subName,
                        sortOrder: sortOrder || 'hot',
                        timeFrame: timeFrame || 'month'
                    }));

                })

            },

            subredditDomain: function(domain, sortOrder, opts) {
                this.doSidebar('front');
                require(['view/subreddit-view'], function(SubredditView) {
                    App.mainRegion.show(new SubredditView({
                        subName: '',
                        sortOrder: sortOrder || 'hot',
                        domain: domain
                    }));

                })
            },

            //'r/:subName/comments/:id/:slug(/):commentLink(/)': 'single',
            single: function(subName, id, slug, commentLink) {
                if (App.subs.length > 1) {
                    App.stop()
                }
                this.doSidebar(subName);

                require(['view/single-view', 'view/bottom-bar-view'], function(SingleView, BottomBarView) {

                    App.mainRegion.show(new SingleView({
                        subName: subName,
                        id: id,
                        commentLink: commentLink || null
                    }));

                    //only update btm bar if the subreddit changes
                    if ((typeof App.bottombarRegion.currentView === 'undefined' || App.bottombarRegion.currentView.subName != subName) && App.settings.get('btmbar') === true && $(document).width() > App.mobileWidth) {
                        App.bottombarRegion.show(new BottomBarView({
                            subName: subName,
                            id: id
                        }))
                    }

                })

            },

            user: function(username, sortOrder) {
                var self = this
                require(['view/user-sidebar-view', 'view/user-view'], function(UserSidebarView, UserView) {

                    App.sidebarRegion.show(new UserSidebarView({
                        username: username
                    }))

                    App.mainRegion.show(new UserView({
                        username: username,
                        sortOrder: sortOrder
                    }));

                });
            },
            compose: function(username) {

                require(['view/compose-view'], function(ComposeView) {
                    App.mainRegion.show(new ComposeView({
                        username: username
                    }));

                });
            },
            inbox: function(type) {

                require(['view/inbox-view'], function(InboxView) {
                    App.mainRegion.show(new InboxView({
                        type: type
                    }));

                });
            },
            download: function(subName) {
                require(['view/download-view'], function(DownloadView) {
                    App.mainRegion.show(new DownloadView({
                        subName: subName
                    }));

                });
            },
            subreddits: function(searchQ) {
                require(['view/subreddit-picker-view'], function(SubredditPickerView) {
                    //if (typeof searchQ === 'undefined') {
                    //searchQ = ''
                    //}
                    App.mainRegion.show(new SubredditPickerView({
                        searchQ: searchQ || ''
                    }))

                })
            },
            search: function(searchQ, timeFrame, sortOrder) {

                this.doSidebar('front');
                require(['view/search-view'], function(SearchView) {
                    App.mainRegion.show(new SearchView({
                        searchQ: searchQ,
                        timeFrame: timeFrame,
                        sortOrder: sortOrder
                    }))
                })
            },
            submit: function(subName, q) {
                this.doSidebar(subName);
                require(['view/submit-view'], function(SubmitView) {
                    App.mainRegion.show(new SubmitView({
                        subName: subName
                    }))
                });
            },
            submitWithUrl: function(q) {
                require(['view/submit-view'], function(SubmitView) {
                    App.mainRegion.show(new SubmitView({
                        q: q
                    }))
                });
            },

            prefs: function() {
                this.doSidebar('front');
                require(['view/prefs'], function(PrefsView) {
                    App.mainRegion.show(new PrefsView())
                });

            },
            test: function() {
                console.log('in TEST view')
                require(['view/test'], function(TestView) {
                    App.mainRegion.show(new TestView())
                });
            },
            embed: function(q) {
                require(['view/embed'], function(EmbedView) {
                    App.mainRegion.show(new EmbedView({
                        q: q
                    }))
                });
            },
            //loads a random subreddit that the user is subscribed to
            myrandom: function() {
                var self = this
                setTimeout(function() {

                    if (typeof App.subreddits.mine !== 'undefined' && App.subreddits.mine.length > 14) {
                        var rand = App.subreddits.mine.at(Math.floor((Math.random() * App.subreddits.mine.length)))
                            // this.subreddit(rand.get('display_name'))
                        Backbone.history.navigate('r/' + rand.get('display_name'), {
                            trigger: true
                        })
                    } else {
                        self.myrandom() //have to wait for the subreddits to load first, this is incredibly ugly, but I have to wait for the subreddit data to load.  Maybe store data in localstorage?
                    }

                }, 100)
            },
            //after the user returns from an Oauth login, send them to this view to "log them in"
            redirectBack: function() {
                require(['view/redirect'], function(RedirectView) {
                    App.mainRegion.show(new RedirectView())
                });
            },

            /*   Util functions
             
             
             */
            //displays the sidebar for that subreddit if its not already created
            doSidebar: function(subName) {
                if (typeof App.sidebarRegion.currentView === 'undefined' || App.sidebarRegion.currentView.subName != subName) { //only update sidebar if the subreddit changes

                    var sidebarModel = new SidebarModel(subName)
                    if (subName == 'front') {
                        App.sidebarRegion.show(new SidebarView({
                            subName: subName,
                            model: sidebarModel
                        }))
                    } else {
                        sidebarModel.fetch({
                            success: function(model) {
                                App.sidebarRegion.show(new SidebarView({
                                    subName: subName,
                                    model: model
                                }))
                            }
                        })
                    }

                    // this.sidebar = new SidebarView({
                    //     subName: subName
                    // })
                }
            },

            initHeader: function() {
                var self = this
                if (App.isMobile() === true) {
                    this.setMobileHeader()
                } else {
                    this.setRegularHeader()
                }

                var resizeFunction = _.debounce(function(e) {

                    console.log('resizing')

                    App.trigger('resized') //tells other views the page has been resized

                    var docWidth = $(document).width()
                    if (docWidth > App.mobileWidth && self.currentHeader === 1) {
                        self.setRegularHeader()
                    } else if (docWidth < App.mobileWidth && self.currentHeader === 0) {
                        self.setMobileHeader()
                    }

                }, 50); // Maximum run of once per 500 milliseconds

                // Add the event listener
                window.addEventListener("resize", resizeFunction, false);

                // $(window).resize(this.debouncer(function(e) {
                //     console.log('resizing')
                //     var docWidth = $(document).width()
                //     if (docWidth > App.mobileWidth && self.currentHeader === 1) {
                //         self.setRegularHeader()
                //     } else if (docWidth < App.mobileWidth && self.currentHeader === 0) {
                //         self.setMobileHeader()
                //     }

                // }));

            },
            setRegularHeader: function() {
                console.log('set regular header')
                this.currentHeader = 0
                //App.headerRegion.close()
                App.headerRegion.show(new HeaderView());
            },
            setMobileHeader: function() {
                console.log('set mobile header')
                this.currentHeader = 1
                //App.headerRegion.close()
                App.headerRegion.show(new MobileHeaderView());
            },

            loadSettingsFromCookies: function() {
                var checkboxes = new Array("btmbar", "cmtLoad", "showSidebar", "infin", 'hideSelf');
                var selectboxes = new Array('linkCount')

                for (var i in checkboxes) {
                    if ((typeof $.cookie(checkboxes[i]) === 'undefined') || $.cookie(checkboxes[i]) == 'true') {
                        App.settings.set(checkboxes[i], true)

                    } else {
                        App.settings.set(checkboxes[i], false)
                    }
                }

                for (var x in selectboxes) {
                    if (typeof $.cookie(selectboxes[x]) === 'undefined') {
                        App.settings.set(selectboxes[x], 50)
                    } else {
                        App.settings.set(selectboxes[x], $.cookie(selectboxes[x]))
                    }
                }

                //update cssType 
                App.settings.set('cssType', $.cookie('cssType') || 'useSrStyles')
                //update useSrEverywhereTxt
                App.settings.set('useSrEverywhereTxt', $.cookie('useSrEverywhereTxt') || '')

                //load grid opt from cookies
                App.settings.set('gridOption', $.cookie('gridOption') || '')

            },
            checkIfNightmode: function() {

                //check if &theme=dark in the url so we can pass into from iframe
                if (window.location.href.indexOf('cssTheme=dark') > 0) {
                    $("#subredditStyle").attr("href", "css/dark/styles.min.css");
                    App.settings.set('enableNightmode', true)
                } else if (window.location.href.indexOf('cssTheme=light') > 0) {
                    App.settings.set('enableNightmode', false)
                }

                if (App.settings.get('cssType') === 'nightmode' && $("#subredditStyle").attr('href') !== 'css/dark/styles.min.css') {
                    $("#subredditStyle").attr("href", "css/dark/styles.min.css");
                } else if (App.settings.get('cssType') === 'useSrEverywhere') {
                    $("#subredditStyle").attr("href", "https://pay.reddit.com/r/" + App.settings.get('useSrEverywhereTxt') + "/stylesheet");
                }
            }

        });

        return AppRouter;

    });