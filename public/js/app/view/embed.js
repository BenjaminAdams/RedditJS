/* embed.js View

Embed reddit in external websites

//ex http://localhost:8002/embed/url=http://imgur.com/XZvyRhU&as=4&fffff=123

*/
define(['App', 'underscore', 'backbone', 'hbs!template/embed', 'hbs!template/blank', 'view/basem-view', 'collection/info'],
    function(App, _, Backbone, Tmpl, BlankTmpl, BaseView, InfoCollection) {
        return BaseView.extend({
            template: Tmpl,
            events: {
                'click .gotoSubmit': 'gotoSubmit'
            },
            ui: {
                embedStatus: '#embedStatus',
                submitBtn: '#submitBtn'
            },
            initialize: function(options) {
                _.bindAll(this);
                this.q = this.getUrlParameters()
                if (typeof this.q.url !== 'undefined') {
                    this.q.url = decodeURIComponent(this.q.url)
                }
                this.searchCollection = null
                this.urlCollection = null

                this.inputTimer = 0 //keeps track of user input and when they stop input it performs a search
                this.lastTitleInput = null //keeps track of the last input in keyboard on title field

                this.setOptions()

            },
            onRender: function() {
                //hide the header with CSS because I am not sure if we still need it or not
                // $('#theHeader').hide()

                this.urlStatus() //find out if the link has already been submitted

                //option passed in
                if (typeof this.q.backgroundColor !== 'undefined') {
                    $('body').css('background-color', '#' + this.q.backgroundColor)
                }

            },
            onBeforeClose: function() {
                $('#theHeader').show()
            },

            setOptions: function() {
                this.submitPostImg = this.q.submitPostImg || 'http://www.reddit.com/static/spreddit11.gif'
                this.postSortOrder = this.q.postSortOrder || 'mostUpvoted'

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

            selectPostWithMostUpvoted: function(gotoPost) {
                this.urlCollection.each(function(post) {
                    //redirect the user to the post with the highest number of comments
                    if (post.get('num_comments') >= gotoPost.get('num_comments')) {
                        gotoPost = post
                    }
                })
                return gotoPost;
            },
            selectNewestPost: function(gotoPost, cb) {
                this.urlCollection.each(function(post) {

                    var newestDate = moment.unix(gotoPost.get('created_utc'))
                    var tmpDate = moment.unix(post.get('created_utc'))

                    //redirect the user to the post with the highest number of comments
                    if (tmpDate < newestDate) {
                        gotoPost = post
                    }
                })
                return gotoPost;
            },
            urlStatus: function() {
                var self = this
                self.ui.embedStatus.addClass('loadingSingle')

                if (this.validURL(this.q.url)) {

                    this.urlCollection = new InfoCollection([], {
                        linkUrl: this.q.url

                    });

                    this.urlCollection.fetch({
                        success: function(data) {
                            var gotoPost;
                            var postsLength = data.length

                            if (postsLength > 0) {

                                gotoPost = self.urlCollection.first()

                                if (self.postSortOrder === 'mostUpvoted') {
                                    gotoPost = self.selectPostWithMostUpvoted(gotoPost)
                                } else if (self.postSortOrder === 'newest') {
                                    gotoPost = self.selectNewestPost(gotoPost)
                                }

                                self.newIframeSize(null, null)

                                Backbone.history.navigate(gotoPost.get('permalink'), {
                                    trigger: true
                                });

                            } else {
                                self.postNotFound();
                            }
                        },
                        error: function(data) {
                            console.log("ERROR inrequest details: ", data);
                            //self.ui.embedStatus.html('unable to fetch data from reddit api').removeClass('loadingSingle')
                            self.newIframeSize(0, 0)
                        }
                    })

                } else {
                    self.ui.embedStatus.html('please enter a valid url').removeClass('loadingSingle')
                }
            },
            postNotFound: function() {
                this.showSubmitThisToReddit();
                $('#theHeader').hide()
                this.newIframeSize(80, null)
            },
            showSubmitThisToReddit: function() {

                var submitBtn = '<img class="gotoSubmit" src="http://www.reddit.com/static/spreddit11.gif" alt="submit to reddit" border="0" />'
                submitBtn += '<div class="md gotoSubmit"> Post not found on reddit. <h3><strong><span class="mdBlue"> Be the first to submit </span></strong></h3> </div>';

                this.ui.submitBtn.html(submitBtn);
                this.newIframeSize(null, null)
            },
            gotoSubmit: function() {
                //example url:  /submit/url=http://dudelol.com/now-that?asdasd=asd

                //change parent size
                this.newIframeSize(600, null)

                var url = '/submit/url=' + this.q.url
                Backbone.history.navigate(url, {
                    trigger: true
                });
            },
            // tellParentWeLoaded: function() {
            //     var postData = {
            //         loadDesiredHeight: true
            //     }
            //     parent.postMessage(postData, "*");
            // },
            // newParentHeight: function(height) {

            //     var postData = {
            //         newHeight: height
            //     }
            //     parent.postMessage(postData, "*");

            // },
            newIframeSize: function(height, width) {
                var postData = {
                    newHeight: height,
                    newWidth: width
                }
                parent.postMessage(postData, "*");
            }

        });
    });