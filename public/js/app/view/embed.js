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
                embedStatus: '#embedStatus'
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
                // $('#theHeader').hide()

                this.urlStatus() //find out if the link has already been submitted

            },
            onBeforeClose: function() {
                $('#theHeader').show()
            },
            //gets the options out of the url

            urlStatus: function() {
                var self = this
                self.ui.embedStatus.addClass('loadingEmbed')

                if (this.validURL(this.q.url)) {

                    this.urlCollection = new InfoCollection([], {
                        linkUrl: this.q.url

                    });

                    this.urlCollection.fetch({
                        success: function(data) {
                            console.log(data)
                            var postsLength = data.length

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
                                self.postNotFound();
                            }
                        },
                        error: function(data) {
                            console.log("ERROR inrequest details: ", data);
                            self.ui.embedStatus.html('unable to fetch data from reddit api').removeClass('loadingEmbed')
                        }
                    })

                } else {
                    self.ui.embedStatus.html('please enter a valid url').removeClass('loadingEmbed')
                }
            },
            postNotFound: function() {
                //this.ui.embedStatus.html('good job, this link has never been submit before').removeClass('loadingEmbed')
                this.showSubmitThisToReddit();
            },
            showSubmitThisToReddit: function() {

                var submitBtn = '<img class="gotoSubmit" src="http://www.reddit.com/static/spreddit11.gif" alt="submit to reddit" border="0" />'
                this.ui.embedStatus.html(submitBtn);
            },
            gotoSubmit: function() {
                //  /submit/url=http://dudelol.com/now-that?asdasd=asd
                var url = '/submit/url=' + this.q.url
                Backbone.history.navigate(url, {
                    trigger: true
                });
            }

        });
    });