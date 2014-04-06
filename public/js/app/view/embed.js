/* embed.js View

Embed reddit in external websites

//ex http://localhost:8002/embed/url=http://imgur.com/XZvyRhU&as=4&fffff=123

*/
define(['App', 'underscore', 'backbone', 'hbs!template/embed', 'view/basem-view', 'collection/info'],
    function(App, _, Backbone, Tmpl, BaseView, InfoCollection) {
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
                $('#theHeader').hide()

                this.urlStatus() //find out if the link has already been submitted

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
            urlStatus: function() {
                var self = this

                if (this.validURL(this.q.url)) {

                    this.urlCollection = new InfoCollection([], {
                        linkUrl: this.q.url

                    });

                    this.urlCollection.fetch({
                        success: function(data) {
                            console.log(data)
                            var postsLength = data.length
                            console.log('length=', postsLength)
                            if (postsLength > 0) {

                                var sendUserToPost = self.urlCollection.first()
                                self.urlCollection.each(function(post) {
                                    //redirect the user to the post with the highest number of comments
                                    if (post.get('num_comments') >= sendUserToPost.get('num_comments')) {
                                        sendUserToPost = post
                                    }
                                })

                                Backbone.history.navigate(sendUserToPost.get('permalink'), {
                                    trigger: true
                                });

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