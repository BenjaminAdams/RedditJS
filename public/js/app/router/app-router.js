define(['App', 'underscore', 'backbone', 'marionette', 'view/header-view', 'view/sidebar-view', 'collection/my-subreddits', 'model/sidebar', 'event/channel', 'view/mobile-header'],
  function(App, _, Backbone, Marionette, HeaderView, SidebarView, MySubredditsCollection, SidebarModel, channel, MobileHeaderView) {
    var AppRouter = Backbone.Marionette.AppRouter.extend({
      initialize: function(options) {
        //load settings
        App.settings = new Backbone.Model()

        App.isBot = false
        var params = this.getUrlParameters()
        if (params.reqAsBot === "1") {
          //var fetchBots = ['https://robot85.herokuapp.com/', 'https://robot86.herokuapp.com/', 'https://robot87.herokuapp.com/']
          // var bot = fetchBots[Math.floor((Math.random() * fetchBots.length))]
          // App.baseURL = bot + 'api/'
          App.isBot = true
        }

        if (typeof params.embedId !== 'undefined') {
          App.embedId = params.embedId
        }

        this.loadSettingsFromCookies()
        this.checkIfNightmode();
        this.checkIfEmbeded()

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

        this.currentHeader = null;
        App.slideShowActive = false;

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
        'r/:subName?reqAsBot=1': 'subreddit',
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
        'comments/:id(/)': 'singleById',

        'comments/:subName/:id/slideshow': 'slideshow',

        'u/:username(/)': 'user',
        'user/:username(/)': 'user',
        'user/:username/:sortOrder(/)': 'user',

        'user/:username/m/:subName(/)': 'multihub',
        'u/:username/m/:subName(/)': 'multihub',

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
          if ((name !== 'single' && name !== 'slideshow') && App.bottombarRegion.currentView) { //hide the bottom bar if not in single view
            //App.bottombarRegion.destroy()
            App.bottombarRegion.empty();
          }

          if (name === 'slideshow' && !App.slideShowActive) { //hide sidebar and header if doing slideshow
            //App.bottombarRegion.destroy()
            App.sidebarRegion.reset();
            App.headerRegion.reset();
            App.slideShowActive = true;
            App.trigger('btmbar:purgeNonImgAndRerender')
          } else if (name !== 'slideshow' && App.slideShowActive) {
            //if user closes slideshow enable header
            router.initHeader();
            App.slideShowActive = false;
            App.trigger('btmbar:restAndrefetch') //we remove models that are not images when we go into slideshow, we need to get those back
              //exit fullscreen if the user was in fullscreen mode
            if (!window.screenTop && !window.screenY) {
              //if already in fullscreen mode toggle it off
              router.exitFullScreen()
            }
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
        this.doSidebar('front', {
          type: 'subreddit'
        });
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

        this.doSidebar(subName, {
          type: 'subreddit'
        });
        this.subName = subName
        this.type = 'subreddit'

        require(['view/subreddit-view'], function(SubredditView) {
          App.mainRegion.show(new SubredditView({
            subName: subName,
            sortOrder: sortOrder || 'hot',
            timeFrame: timeFrame || 'month',
            type: 'subreddit'
          }));

        })

      },
      multihub: function(userName, subName, sortOrder, timeFrame, mode) {
        if (App.subs.length > 1) {
          App.stop()
        }
        this.doSidebar(subName, {
          type: 'multihub',
          userName: userName
        });
        this.subName = subName;
        this.type = 'multihub';
        this.userName = userName;

        require(['view/subreddit-view'], function(SubredditView) {

          App.mainRegion.show(new SubredditView({
            subName: subName,
            sortOrder: sortOrder || 'hot',
            timeFrame: timeFrame || 'month',
            type: 'multihub',
            userName: userName
          }));

        })
      },

      subredditDomain: function(domain, sortOrder, opts) {
        this.doSidebar('front', {
          type: 'subreddit'
        });
        require(['view/subreddit-view'], function(SubredditView) {
          App.mainRegion.show(new SubredditView({
            subName: '',
            sortOrder: sortOrder || 'hot',
            domain: domain
          }));
        })
      },
      slideshow: function(subName, id) {

        require(['view/slideshow-view'], function(View) {
          App.mainRegion.show(new View({
            subName: subName,
            id: id
          }));
        })

        this.doBtmBar(subName, id)
      },
      //'r/:subName/comments/:id/:slug(/):commentLink(/)': 'single',
      single: function(subName, id, slug, commentLink) {
        var self = this
        if (App.subs.length > 1) {
          App.stop()
        }
        this.doSidebar(subName, {
          type: 'subreddit'
        });

        this.subName = subName

        require(['view/single-view'], function(SingleView) {

          App.mainRegion.show(new SingleView({
            subName: subName,
            id: id,
            commentLink: commentLink || null
          }));

          self.doBtmBar(subName, id)

        })

      },
      //for loading the widget by post ID
      singleById: function(id) {
        require(['view/single-view'], function(SingleView) {

          App.mainRegion.show(new SingleView({
            subName: '',
            id: id,
            commentLink: null
          }));
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
          App.mainRegion.show(new SubredditPickerView({
            searchQ: searchQ || ''
          }))

        })
      },
      search: function(searchQ, timeFrame, sortOrder) {

        // this.doSidebar(subName, {
        //   type: 'subreddit'
        // })

        this.doSidebar('front', {
          type: 'subreddit'
        })

        require(['view/search-view'], function(SearchView) {
          App.mainRegion.show(new SearchView({
            searchQ: searchQ,
            timeFrame: timeFrame,
            sortOrder: sortOrder
          }))
        })
      },
      submit: function(subName, q) {
        this.doSidebar(subName, {
          type: 'subreddit'
        });
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
        this.doSidebar('front', {
          type: 'subreddit'
        });
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
      doSidebar: function(subName, type) {
        if ((typeof App.sidebarRegion.currentView === 'undefined' || App.sidebarRegion.currentView.subName != subName) && App.isBot === false) { //only update sidebar if the subreddit changes

          var sidebarModel = new SidebarModel(subName, type)
          if (subName === 'front' || subName === 'all') {
            App.sidebarRegion.show(new SidebarView({
              subName: 'front',
              type: type,
              model: sidebarModel
            }))
          } else {
            sidebarModel.fetch({
              success: function(model) {
                App.sidebarRegion.show(new SidebarView({
                  subName: subName,
                  type: type,
                  model: model
                }))
              }
            })
          }

        }
      },
      doBtmBar: function(subName, id) {
        //only update btm bar if the subreddit changes
        if ((typeof App.bottombarRegion.currentView === 'undefined' || App.bottombarRegion.currentView.subName != subName) && App.settings.get('btmbar') === true && ($(document).width() > App.mobileWidth || App.slideShowActive)) {

          require(['view/bottom-bar-view'], function(BottomBarView) {
            App.bottombarRegion.show(new BottomBarView({
              subName: subName,
              id: id
            }))
          })

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

          if (App.slideShowActive) return

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
          //App.headerRegion.destroy()
        App.headerRegion.show(new HeaderView({
          subName: this.subName
        }));
      },
      setMobileHeader: function() {
        console.log('set mobile header')
        this.currentHeader = 1
          //App.headerRegion.destroy()
        App.headerRegion.show(new MobileHeaderView());
      },
      //backbone cant parse the complex URL we are passing it, use vanillaJS
      getUrlParameters: function(b) {
        var qsParm = []
        var query = window.location.search.substring(1);
        var parms = query.split('&');
        for (var i = 0; i < parms.length; i++) {
          var pos = parms[i].indexOf('=');
          if (pos > 0) {
            var key = parms[i].substring(0, pos);
            var val = parms[i].substring(pos + 1);
            qsParm[key] = val;
          }
        }
        return qsParm;
      },
      exitFullScreen: function(e) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
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

        //settings for hiding grid options, force it to be normal
        if (window.location.hash) {
          var hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
          if (hash === "hideOpts") {
            setTimeout(function() {
              App.settings.set('gridOption', 'normal')
            })

          }

        }

        //bot settings
        if (App.isBot === true) {
          App.settings.set('btmbar', false)
          App.settings.set('showSidebar', false)
          App.settings.set('cssType', 'noCSS')

        }

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
      },
      checkIfEmbeded: function() {

        //check if &theme=dark in the url so we can pass into from iframe
        if (window.location.href.indexOf('embed?') > 0) {
          App.isEmbeded = true
        }

      }

    });

    return AppRouter;

  });
