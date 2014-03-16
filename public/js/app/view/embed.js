/* embed.js View

Embed reddit in external websites

//ex http://redditjs.com/embed/url=http://dudelol.com/now-that-youre-big-dr-suess-style-sex-ed-book&as=4&fffff=123

*/
define(['App', 'underscore', 'backbone', 'hbs!template/embed', 'view/basem-view'],
    function(App, _, Backbone, Tmpl, BaseView, SubredditCollection) {
        return BaseView.extend({
            template: Tmpl,
            events: {
                'change input': 'updateSettings'
            },
            ui: {
                load1000: '#load1000'
            },
            initialize: function(options) {
                _.bindAll(this);
                this.q = this.extractUrl(options.q)
                console.log(this.q)

                this.searchCollection = null
                this.urlCollection = null

                this.inputTimer = 0 //keeps track of user input and when they stop input it performs a search
                this.lastTitleInput = null //keeps track of the last input in keyboard on title field

            },
            onRender: function() {
                //hide the header with CSS because I am not sure if we still need it or not
                //TODO: Do I really need it?
                $('#theHeader').hide()

            },
            onBeforeClose: function() {
                $('#theHeader').show()
            },
            //gets the options out of the url
            extractUrl: function(q) {
                var opt = {}
                q.split('&').forEach(function(name) {
                    var split = name.split('=')
                    opt[split[0]] = split[1]
                });
                return opt
            },
            leaveUrl: function(e) {
                var self = this
                var target = $(e.currentTarget)
                var linkUrl = target.val()

                //always clear strike outs
                this.removeStrikeOutSRs()
                this.ui.urlDetails.html('').addClass('loadingSubmit')
                this.ui.alreadySubmitted.slideUp()

                if (this.validURL(linkUrl)) {
                    //query /api/info
                    //example url https://pay.reddit.com/api/info.json?url=http://i.imgur.com/40y06q0.jpg&r=funny&jsonp=?
                    //"http://api.reddit.com/api/info?url= " + linkUrl + ".json?jsonp=?" 

                    this.urlCollection = new InfoCollection([], {
                        linkUrl: linkUrl
                        //subName: this.selectedSubreddit  //don't filter by subreddit

                    });
                    this.urlCollection.fetch({
                        success: function(data) {
                            console.log(data)
                            var postsLength = data.length
                            console.log('length=', postsLength)
                            if (postsLength > 0) {
                                var addPlus = '';
                                if (postsLength >= 100) {
                                    addPlus = '+'

                                }
                                self.ui.urlDetails.html('this url has been submitted <span class="sameURL" >' + postsLength + addPlus + '</span> time(s) before').removeClass('loadingSubmit')
                                //get array of subreddits that link has been submitted too
                                var subreddits = []
                                console.log('data=', data)
                                _.forEach(data.models, function(post) {

                                    if ($.inArray(post.get('subreddit'), subreddits)) {
                                        subreddits.push(post.get('subreddit'))
                                    }

                                })

                                self.strikeOutSRs(subreddits)
                            } else {
                                self.ui.urlDetails.html('good job, this link has never been submit before').removeClass('loadingSubmit')
                            }
                        },
                        error: function(data) {
                            console.log("ERROR inrequest details: ", data);
                            self.ui.urlDetails.html('unable to fetch data from reddit api').removeClass('loadingSubmit')
                        }
                    })

                } else {
                    self.ui.urlDetails.html('please enter a valid url').removeClass('loadingSubmit')
                }
            }

        });
    });