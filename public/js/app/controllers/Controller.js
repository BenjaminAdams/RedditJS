define(['App', 'backbone', 'marionette', 'view/subreddit-view', 'view/header-view', 'view/search-view', 'view/single', 'view/sidebar-view', 'view/bottom-bar-view'],
    function(App, Backbone, Marionette, SubredditView, HeaderView, SearchView, SingleView, SidebarView, BottomBarView) {
        return Backbone.Marionette.Controller.extend({
            initialize: function(options) {
                //load settings

                window.settings = new Backbone.Model()
                this.loadSettingsFromCookies()

                //what happens if we keep subreddits in a global?
                window.subs = []
                // this.loadCollectionsFromStorage()

                //   App.headerRegion.show(new HeaderView());

                this.header = new HeaderView();
            },
            home: function(sortOrder) {

                // channel.trigger("header:updateSortOrder")

                this.doSidebar('front');

                var subredditView = new SubredditView({
                    subName: "front",
                    sortOrder: sortOrder || 'hot'
                });
            },

            subreddit: function(subName, sortOrder) {

                this.doSidebar(subName);

                var subredditView = new SubredditView({
                    subName: subName,
                    sortOrder: sortOrder || 'hot'
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
                    id: id
                });

                if (window.settings.get('btmbar') === true) {
                    if ((typeof this.bottomBar === 'undefined' || this.bottomBar === null) || this.bottomBar.subName != subName) { //only update btm bar if the subreddit changes
                        this.bottomBar = new BottomBarView({
                            subName: subName,
                            id: id
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
                        username: username
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
                        username: username
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
                    sortOrder: sortOrder
                });
            },
            submit: function(subName) {
                this.doSidebar(subName);
                require(['view/submit-view'], function(SubmitView) {
                    var submitView = new SubmitView({
                        subName: subName
                    });
                });
            },

            prefs: function() {
                this.doSidebar('front');
                require(['view/prefs'], function(PrefsView) {

                    var prefsView = new PrefsView();
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
                        subName: subName
                    })
                }
            },
            loadSettingsFromCookies: function() {
                var checkboxes = new Array("btmbar", "cmtLoad", "customCSS", "showSidebar", "infin");
                var selectboxes = new Array('linkCount')

                for (var i in checkboxes) {

                    if (typeof $.cookie(checkboxes[i]) === 'undefined' || $.cookie(checkboxes[i]) == 'true') {
                        window.settings.set(checkboxes[i], true)
                    } else {
                        window.settings.set(checkboxes[i], false)
                    }
                }

                for (var x in selectboxes) {
                    if (typeof $.cookie(selectboxes[x]) === 'undefined') {
                        window.settings.set(selectboxes[x], 25)
                    } else {
                        window.settings.set(selectboxes[x], $.cookie(selectboxes[x]))
                    }
                }

            }

        });
    });