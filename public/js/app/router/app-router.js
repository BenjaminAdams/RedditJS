define(['App', 'underscore', 'backbone', 'marionette', 'view/header-view', 'view/sidebar-view', 'collection/my-subreddits', 'model/sidebar', 'event/channel'],
    function(App, _, Backbone, Marionette, HeaderView, SidebarView, MySubredditsCollection, SidebarModel, channel) {

        var AppRouter = Backbone.Marionette.AppRouter.extend({
            initialize: function(options) {
                //load settings
                App.settings = new Backbone.Model()
                this.loadSettingsFromCookies()
                App.subreddits = {}
                App.subreddits.mine = new MySubredditsCollection()
                //caching subreddit json in a global because it takes about 3 seconds to query from reddit api
                App.subs = []

                //so you can link users to a subreddit with a particular view.  Ex:  http://redditjs.com/r/aww#grid
                if (window.location.hash) {
                    var hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
                    if (hash == 'grid' || hash == 'small' || hash == 'large' || hash == 'normal')
                        $.cookie('gridOption', hash, {
                            path: '/'
                        });
                }

                App.headerRegion.show(new HeaderView());
            },
            routes: {
                'r/myrandom(/)': 'myrandom',
                'r/:subName/submit(/)': 'submit',
                'submit(/)': 'submit',
                'prefs(/)': 'prefs',
                'test(/)': 'test',
                'subreddits(/)': 'subreddits',
                'subreddits(/):q': 'subreddits',
                '(:sortOrder)(/)': 'home',

                'r/:subName(/)': 'subreddit',
                'r/:subName?mode=:mode': 'subreddit',
                'r/:subName/:sortOrder(/)': 'subreddit',
                'r/:subName/:sortOrder/:timeFrame': 'subreddit',

                'domain/:domain(/)': 'subredditDomain',
                'domain/:domain/:sortOrder(/)': 'subredditDomain',

                'r/:subName/comments/:id(/)': 'single',
                'r/:subName/comments/:id/:slug(/)': 'single',
                'r/:subName/comments/:id/:slug/:commentLink(/)': 'single',

                'u/:username(/)': 'user',
                'user/:username(/)': 'user',
                'user/:username/:sortOrder(/)': 'user',

                'message/compose/:username(/)': 'compose',
                'message/:type(/)': 'inbox',

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

            subredditDomain: function(domain, sortOrder) {
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
            submit: function(subName) {
                this.doSidebar(subName);
                require(['view/submit-view'], function(SubmitView) {
                    App.mainRegion.show(new SubmitView({
                        subName: subName
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
            loadSettingsFromCookies: function() {
                var checkboxes = new Array("btmbar", "cmtLoad", "customCSS", "showSidebar", "infin");
                var selectboxes = new Array('linkCount')

                for (var i in checkboxes) {

                    if (typeof $.cookie(checkboxes[i]) === 'undefined' || $.cookie(checkboxes[i]) == 'true') {
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

            }

        });

        return AppRouter;

    });