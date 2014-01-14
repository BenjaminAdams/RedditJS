/* test.js View

A playground

*/
define(['App', 'underscore', 'backbone', 'hbs!template/test', 'view/basem-view', 'collection/subreddit'],
    function(App, _, Backbone, TestTmpl, BaseView, SubredditCollection) {
        return BaseView.extend({
            template: TestTmpl,
            events: {
                //'submit #newlink': "submitForm",
                'change input': 'updateSettings',
                "change select": "updateSettings"
            },
            ui: {
                load1000: '#load1000',
                numberofSrsInMemory: '#numberofSrsInMemory',
                displayAllSRS: '#displayAllSRS'
            },
            initialize: function(options) {
                _.bindAll(this);
                //this.model = null

            },
            onRender: function() {
                this.load1000()
                this.countSubreddits()
            },
            load1000: function() {
                var self = this
                this.collection = new SubredditCollection([], {
                    domain: null,
                    subName: 'funny',
                    sortOrder: 'hot',
                    timeFrame: null
                    //instanceUrl: '/data/1000posts.json' //override the auto generated subreddit URL
                });
                this.fetchMore()
                // this.collection.fetch({
                //     remove: false,
                //     success: function(data) {

                //         //App.subs['funnynullhotmonth'] = self.collection
                //         console.log('subs in memory', App.subs)

                //     },
                //     error: function(data, x, y) {
                //         console.log('error getting test SR', data, x, y)
                //     }
                // })
                App.subs.funnynullhotmonth = self.collection

            },
            countSubreddits: function() {
                var self = this
                var count = 0
                for (var k in App.subs) {
                    if (App.subs.hasOwnProperty(k)) {
                        ++count;
                        self.ui.displayAllSRS.append('<li>' + k + '  length= ' + App.subs[k].length + '</li>')
                    }
                }

                this.ui.numberofSrsInMemory.html('You have ' + count + ' subreddit(s) in memory')
            },
            fetchMore: function() {

                //$(this.el).append("<div class='loading'> </div>")
                this.loading = true

                if (this.collection.after == "stop") {
                    this.ui.load1000.html('1000 posts now in memory, goto <a href="/r/funny">/r/funny</a> ')
                } else {
                    this.ui.load1000.html('You have ' + this.collection.length + ' posts in /r/funny <img src="/img/loading.gif" />  ')
                    this.collection.fetch({
                        success: this.fetchMore,
                        error: function(data, x, y) {
                            console.log('error getting test SR', data, x, y)
                        },
                        remove: false
                    });
                }
            }

        });
    });