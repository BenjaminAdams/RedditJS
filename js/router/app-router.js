define(['underscore', 'backbone', 'view/subreddit-view', 'view/header-view', 'view/search-view', 'view/single', 'view/sidebar-view', 'view/bottom-bar-view', 'event/channel', 'backbone-queryparams'],
    function(_, Backbone, SubredditView, HeaderView, SearchView, SingleView, SidebarView, BottomBarView, channel) {

        var AppRouter = Backbone.Router.extend({

            initialize: function() {
                //load settings

                window.settings = new Backbone.Model()
                this.loadSettingsFromCookies()

                //what happens if we keep subreddits in a global?
                window.subs = new Array()
                // this.loadCollectionsFromStorage()

                Backbone.history.start({
                    pushState: true,
                    root: "/"
                });

                this.header = new HeaderView();

            },
            routes: {
                'r/myrandom(/)': 'myrandom',
                'r/:subName/submit(/)': 'submit',
                'submit(/)': 'submit',
                'prefs(/)': 'prefs',
                '(:sortOrder)(/)': 'home',
                'r/:subName(/)': 'subreddit',
                'r/:subName/:sortOrder(/)': 'subreddit',
                //http://www.reddit.com/domain/i.imgur.com/new/
                'domain/:domain(/)': 'subredditDomain',
                'domain/:domain/:sortOrder(/)': 'subredditDomain',

                'r/:subName/comments/:id/:slug(/)': 'single',
                'r/:subName/comments/:id(/)': 'single',

                'user/:username(/)': 'user',
                'user/:username/:sortOrder(/)': 'user',
                'message/compose/:username(/)': 'compose',
                'message/:type(/)': 'inbox',
                'subreddits(/)': 'subreddits',
                'search': 'search',
                'search/:q(/)': 'search',
                'search/:q/:timeFrame(/)': 'search',
                'search/:q/:timeFrame/:sortOrder(/)': 'search',

            },
            //middleware, this will be fired before every route
            route: function(route, name, callback) {
                var router = this;
                if (!callback) callback = this[name];
                var f = function() {
                    //middleware functions
                    console.log('usr=', $.cookie('username'))

                    //check if user is a reddit gold subscriber
                    // if (window.settings.get('gold') != true && $.cookie('username') != 'armastevs') {

                    //     //  $('.content').html('redditJS is for reddit gold members only, coming soon =)')

                    // require(['view/login-popup-view'], function(LoginPopupView) {

                    //     var loginPopupView = new LoginPopupView({
                    //         el: "#popupWindow"
                    //     })

                    //     });

                    //     return;
                    // }

                    channel.trigger("subreddit:remove") //clear old subreddit views
                    channel.trigger("single:remove") //clear old subreddit views

                    if (name != 'single') { //hide the bottom bar if not in single view
                        $("#bottom-bar").hide()
                        channel.trigger("btmbar:remove")
                        this.bottomBar = null;

                    }

                    $('#imgCache').empty() //flush the image thumbnail cache

                    //end middleware functions
                    callback.apply(router, arguments); //call the actual route
                };
                return Backbone.Router.prototype.route.call(this, route, name, f);
            },

            /***************************
            Route Functions

            ***************************/

            home: function(sortOrder) {

                // channel.trigger("header:updateSortOrder")

                this.doSidebar('front');

                var subredditView = new SubredditView({
                    subName: "front",
                    sortOrder: sortOrder || 'hot',
                });
            },

            subreddit: function(subName, sortOrder) {

                this.doSidebar(subName);

                var subredditView = new SubredditView({
                    subName: subName,
                    sortOrder: sortOrder || 'hot',
                });

            },

            subredditDomain: function(domain, sortOrder) {
                console.log('domain route')
                this.doSidebar('front');
                var subredditView = new SubredditView({
                    subName: '',
                    sortOrder: sortOrder || 'hot',
                    domain: domain
                });
            },

            single: function(subName, id) {

                this.doSidebar(subName);

                var singleView = new SingleView({
                    subName: subName,
                    id: id,
                });

                if (window.settings.get('btmbar') == true) {
                    if ((typeof this.bottomBar === 'undefined' || this.bottomBar == null) || this.bottomBar.subName != subName) { //only update btm bar if the subreddit changes
                        this.bottomBar = new BottomBarView({
                            subName: subName,
                            id: id,
                        })
                    } else {
                        this.bottomBar.show()
                    }
                }

            },

            user: function(username, sortOrder) {
                var self = this
                require(['view/user-sidebar-view', 'view/user-view'], function(UserSidebarView, UserView) {
                    self.sidebar = new UserSidebarView({
                        username: username,
                    })
                    console.log('in router =', username + " " + sortOrder)
                    var userView = new UserView({
                        username: username,
                        sortOrder: sortOrder
                    });
                });
            },
            compose: function(username) {
                console.log('compose view', username)
                require(['view/compose-view'], function(ComposeView) {
                    var composeView = new ComposeView({
                        username: username,
                    });
                });
            },
            inbox: function(type) {
                console.log('msg view, type= ', type)
                require(['view/inbox-view'], function(InboxView) {
                    var inboxView = new InboxView({
                        type: type
                    });
                });
            },
            subreddits: function() {

            },
            search: function(searchQ, timeFrame, sortOrder) {

                this.doSidebar('front');

                var search = new SearchView({
                    searchQ: searchQ,
                    timeFrame: timeFrame,
                    sortOrder: sortOrder,
                });
            },
            submit: function(subName) {
                this.doSidebar(subName);
                require(['view/submit-view'], function(SubmitView) {
                    var SubmitView = new SubmitView({
                        subName: subName
                    });
                });
            },

            prefs: function() {
                this.doSidebar('front');
                require(['view/prefs'], function(PrefsView) {

                    var PrefsView = new PrefsView();
                });

            },
            //loads a random subreddit that the user is subscribed to
            myrandom: function() {
                var self = this
                setTimeout(function() {

                    if (typeof window.subreddits !== 'undefined' && window.subreddits.length > 14) {
                        var rand = window.subreddits.at(Math.floor((Math.random() * window.subreddits.length)))
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
                if (typeof this.sidebar === 'undefined' || this.sidebar.subName != subName) { //only update sidebar if the subreddit changes
                    this.sidebar = new SidebarView({
                        subName: subName,
                    })
                }
            },
            loadSettingsFromCookies: function() {
                var checkboxes = new Array("btmbar", "cmtLoad", "customCSS", "showSidebar", "infin");
                var selectboxes = new Array('linkCount')

                for (i in checkboxes) {

                    if (typeof $.cookie(checkboxes[i]) === 'undefined' || $.cookie(checkboxes[i]) == 'true') {
                        window.settings.set(checkboxes[i], true)
                    } else {
                        window.settings.set(checkboxes[i], false)
                    }
                }

                for (i in selectboxes) {
                    if (typeof $.cookie(selectboxes[i]) === 'undefined') {
                        window.settings.set(selectboxes[i], 25)
                    } else {
                        window.settings.set(selectboxes[i], $.cookie(selectboxes[i]))
                    }
                }
                // var params = {
                //     btmbar: $.cookie('btmbar') ? true : false,
                //     cmtLoad: $.cookie('cmtLoad') ? true : false,
                //     customCSS: $.cookie('customCSS') ? true : false,
                //     hideSidebar: $.cookie('showSidebar') ? true : false,
                //     infin: $.cookie('infin') ? true : false,
                //     linkCount: $.cookie('linkCount') ? $.cookie('linkCount') : '100',

                // };
                //console.log('settings params=', params)
                //    window.settings.set(params)
                //  console.log(window.settings)
            },
            //loads subreddit collections from localstorage and puts them in memory
            // loadCollectionsFromStorage: function() {
            //     for (var i in window.localStorage) {
            //         val = localStorage.getItem(i);
            //         window.subs[i] = val
            //     }
            // }

        });

        return AppRouter;

    });