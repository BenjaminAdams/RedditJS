define(['App', 'underscore', 'backbone', 'cookie'],
  function(App, _, Backbone, Cookie) {
    return Backbone.Marionette.LayoutView.extend({

      // destroy: function() {
      //   console.log("destroying a view")
      //   this.remove();
      //   this.unbind();
      // },
      api: function(url, type, params, callback) {
        if (this.checkIfLoggedIn() === true || params.byPassAuth === true) {

          $.ajax({
            url: "/api?url=" + url,
            type: type,
            dataType: "json",
            data: params,
            success: function(data) {
              console.log('SUCCESS=', data)
              callback(data)
            },
            error: function(data) {
              console.log("ERROR inrequest details: ", data);
              callback(data)

            }
          });
        } else {
          console.log("params in not logged in", params)
          alert("Please login to do that")
        }
      },
      apiNonAuth: function(url, type, params, callback) {
        $.ajax({
          url: "/apiNonAuth?url=" + url,
          type: type,
          dataType: "json",
          data: params,
          success: function(data) {
            console.log('SUCCESS=', data)
            callback(data)
          },
          error: function(data) {
            console.log("ERROR inrequest details: ", data);
            callback(data)

          }
        });

      },
      checkIfLoggedIn: function() {
        if (App.user) {
          return true
        } else {
          return false
        }
      }, //so we resize it does not do a resize for every pixel the user resizes
      //it has a timeout that fires after the user is done resizing
      debouncer: function(func) {
        var timeoutID, timeout = timeout || 100;
        return function() {
          var scope = this,
            args = arguments;
          clearTimeout(timeoutID);
          timeoutID = setTimeout(function() {
            func.apply(scope, Array.prototype.slice.call(args));
          }, timeout);
        }
      },
      //smooth scrolling to the top of the screen
      scrollTop: function() {
        console.log('scrolltop now')
        $('html, body').animate({
          scrollTop: 0
        }, 150);
      },
      dynamicStylesheet: function(name) {

        if (App.settings.get('cssType') === 'nightmode' || App.settings.get('enableNightmode') === true) {
          return
        }

        if (name === null && App.settings.get('cssType') !== 'nightmode') {
          $("#subredditStyle").attr("href", "");
        }

        if (App.settings.get('cssType') === 'useSrStyles' && $(document).width() > App.mobileWidth) {
          if (this.subName == 'front' || this.subName === null) {
            $("#subredditStyle").attr("href", "");
          } else {
            $("#subredditStyle").attr("href", "https://pay.reddit.com/r/" + name + "/stylesheet");
          }
        }
      },
      //Can be used to vote on a post or a comment
      vote: function(dir, id) {
        var self = this
        var params = {
          id: id,
          dir: dir,
          uh: $.cookie('modhash')
        };

        console.log(params)

        this.api("api/vote", 'POST', params, function(data) {
          console.log("vote done", data)

        });

      },
      upvote: function(e) {
        e.preventDefault()
        e.stopPropagation()

        if (this.checkIfLoggedIn() === true) {
          if (typeof this.model !== 'undefined' && this.model.get('likes') === false || this.model.get('likes') === null) {
            console.log('upvoting', this.model)
            this.vote(1, this.model.get('name'))
            var id = this.model.get('id')
            this.model.set('likes', true)
            this.model.set('downmod', 'down')
            this.model.set('upmod', 'upmod')
            this.model.set('voted', 'likes')

            // this.$('.midcol .dislikes').hide()
            // this.$('.midcol .likes').show()
            // this.$('.midcol .unvoted').hide()

            this.ui.midcol.removeClass('unvoted likes dislikes')
            this.ui.midcol.addClass('likes')

            // this.$('.upArrow').addClass('upmod')
            // this.$('.upArrow').removeClass('up')
            // this.$('.downArrow').addClass('down')
            // this.$('.downArrow').removeClass('downmod')
            this.ui.upArrow.addClass('upmod')
            this.ui.upArrow.removeClass('up')
            this.ui.downArrow.addClass('down')
            this.ui.downArrow.removeClass('downmod')

          } else {
            this.cancelVote()
          }
        } else {
          this.showLoginBox()
        }
      },
      downvote: function(e) {
        e.preventDefault()
        e.stopPropagation()
        if (this.checkIfLoggedIn() === true) {
          if (this.model.get('likes') === true || this.model.get('likes') === null) {

            this.vote(-1, this.model.get('name'))
            var id = this.model.get('id')
            this.model.set('likes', false)
            this.model.set('downmod', 'downmod')
            this.model.set('upmod', 'up')
            this.model.set('voted', 'dislikes')

            this.ui.midcol.removeClass('unvoted likes dislikes')
            this.ui.midcol.addClass('dislikes')

            this.ui.upArrow.addClass('up')
            this.ui.upArrow.removeClass('upmod')
            this.ui.downArrow.addClass('downmod')
            this.ui.downArrow.removeClass('down')

          } else {
            this.cancelVote()
          }
        } else {
          this.showLoginBox()
        }
      },
      cancelVote: function() {
        this.vote(0, this.model.get('name'))
        var id = this.model.get('id')
        this.model.set('likes', null)
        this.model.set('downmod', 'down')
        this.model.set('upmod', 'up')
        this.model.set('voted', 'unvoted')

        this.ui.midcol.removeClass('unvoted likes dislikes')
        this.ui.midcol.addClass('unvoted')

        this.ui.upArrow.addClass('up')
        this.ui.upArrow.removeClass('upmod')
        this.ui.downArrow.addClass('down')
        this.ui.downArrow.removeClass('downmod')
      },
      save: function(id) {
        if (this.checkIfLoggedIn() === true) {
          var self = this
          var params = {
            id: id,
            dir: dir,
            uh: $.cookie('modhash')
          };

          this.api("api/vote", 'POST', params, function(data) {
            console.log("saving done", data)
            self.model.set('saved', true)

          });
        } else {
          this.showLoginBox()
        }
      },
      //attempts to create a new comment
      comment: function(e) {
        e.preventDefault()
        e.stopPropagation()

        if (this.checkIfLoggedIn() === true) {
          var self = this

          var id = this.model.get('name')
            //var text = this.$('#text' + id).val()
          var text = this.ui.text.val()
          text = this.sterilize(text) //clean the input

          var params = {
            api_type: 'json',
            thing_id: id,
            text: text,
            uh: $.cookie('modhash')
          };
          console.log(params)

          this.api("/api/comment", 'POST', params, function(data) {
            console.log("comment done", data)
            self.commentCallback(data)
          });
        } else {
          this.showLoginBox()
        }
      }, //callback after trying to write a comment
      toggleShare: function(e) {
        e.preventDefault()
        e.stopPropagation()
        if (this.$('.shareLinkDown').length > 0) {
          this.$('.shareLinkDown')[0].remove()
        } else {
          //TODO: fix ugly hack for it to select all on click
          var shareUrl = $("<div class='shareLinkDown'><input onclick='this.select()' type='text' value='http://redditjs.com" + this.model.get('permalink') + "' />")
          this.$('.flat-list').after(shareUrl)
            //shareUrl.delay(10).focus().select()
        }

      },
      commentCallback: function(data) {
        console.log('callback comment=', data)
        CommentModel = require('model/comment') //in order to have nested models inside of models we need to do this
        CommentView = require('view/comment-view') //in cases of recursion its ok!

        //post comment to have the new ID from this data 
        if (typeof data !== 'undefined' && typeof data.json !== 'undefined' && typeof data.json.data !== 'undefined' && typeof data.json.data.things !== 'undefined') {
          //status{{model.name}}
          this.ui.status.html('<span class="success">success!</span>')
            //data.json.data.things[0].data.link_id = this.model.get('name')
          var attributes = data.json.data.things[0].data
          attributes.author = $.cookie('username');

          //this if statement will only fire during a comment callback
          if (typeof attributes.body_html === 'undefined' && typeof attributes.contentHTML === 'string') {
            attributes.body_html = attributes.contentHTML
          }

          attributes.name = attributes.id
          if (typeof attributes.link === 'undefined') {
            attributes.link_id = this.model.get('name')

          } else {
            attributes.link_id = attributes.link
          }

          attributes.likes = true
          attributes.subreddit = this.model.get('subreddit')
          attributes.smallid = attributes.id.replace('t1_', '')
          attributes.smallid = attributes.id.replace('t3_', '')
          attributes.permalink = '/r/' + data.subreddit + '/comments/' + attributes.link_id + "#" + attributes.id

          attributes.downs = 0
          attributes.ups = 1

          //clear the users text
          this.ui.text.val("")

          var newModel = new CommentModel(attributes) //shouldn't have to input this data into the model twice
          this.hideUserInput()

          newModel.set('permalink', this.permalinkParent + attributes.id)
          newModel.set('permalinkParent', this.permalinkParent)

          App.trigger("comment:addOneChild" + newModel.get('parent_id'), newModel);

        } else {
          //this.$('.status' + this.model.get('name')).html('error ' + data)
          //this.ui.status.html('<div class="error">' + data.json.errors[0][1] + '</div>')

          //var msg = data.json.errors[0][1]
          var msgAry = ((data || {}).json || {}).errors;
          var msg = 'An error has happened while posting your comment'
          if (typeof msgAry[0] !== 'undefined' && typeof msgAry[0][1] !== 'undefined') {
            msg = msgAry[0][1]
          }

          this.ui.status.html('<div class="error">' + msg + '</div>')

          //this.ui.status.html('<div class="error">' + data.responseText + '</div>')

        }
      }, //hides the comment reply textbox
      hideUserInput: function(e) {
        if (typeof e !== 'undefined') {
          e.preventDefault()
          e.stopPropagation()
        }
        this.ui.commentreply.hide()
      },
      validURL: function(str) {
        var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
          '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        if (!pattern.test(str)) {
          return false;
        } else {
          return true;
        }
      },
      //sterilizes user input 
      sterilize: function(HTMLString) {
        HTMLString = HTMLString.replace(/<img /gi, "<imga ");
        var att, x = 0,
          y, coll, c = [],
          probe = document.createElement("div");
        probe.innerHTML = HTMLString;
        coll = probe.getElementsByTagName("*");
        while (coll[x]) {
          if (coll[x]) {
            c.push(coll[x++])
          }

        }
        for (x in c)
          if (/(script|object|embed|iframe)/i.
            /*you can blacklist more tags here!*/
            test(c[x].tagName)) {
            c[x].outerHTML = "";
          } else {
            if (c[x].href)
              if (/java/.test(coll[x].protocol)) {
                c[x].href = "#"
              }
            att = c[x].attributes;
            for (y in att)
              if (att[y])
                if (/(^on|style)/i.test(att[y].name))
                  c[x].removeAttribute(att[y].name);
          }
        c = probe.innerHTML.replace(/imga/gi, "img");
        return c.replace(/<\/img>/gi, "");
      }, //shows the user markdown help 
      showMdHelp: function(e) {
        e.preventDefault()
        e.stopPropagation()

        var mdHelp = '<p></p><p>reddit uses a slightly-customized version of <a href="http://daringfireball.net/projects/markdown/syntax">Markdown</a> for formatting. See below for some basics, or check <a href="/wiki/commenting">the commenting wiki page</a> for more detailed help and solutions to common issues.</p><p></p><table class="md"><tbody><tr style="background-color: #ffff99;text-align: center"><td><em>you type:</em></td><td><em>you see:</em></td></tr><tr><td>*italics*</td><td><em>italics</em></td></tr><tr><td>**bold**</td><td><b>bold</b></td></tr><tr><td>[reddit!](http://reddit.com)</td><td><a href="http://reddit.com">reddit!</a></td></tr><tr><td>* item 1<br>* item 2<br>* item 3</td><td><ul><li>item 1</li><li>item 2</li><li>item 3</li></ul></td></tr><tr><td>>quoted text</td><td><blockquote>quoted text</blockquote></td></tr><tr><td>Lines starting with four spaces<br>are treated like code:<br><br><span class="spaces">    </span>if 1 * 2 <3:<br><span class="spaces">        </span>print "hello, world!"<br></td><td>Lines starting with four spaces<br>are treated like code:<br><pre>if 1 * 2 <3:<br>    print "hello, world!"</pre></td></tr><tr><td>~~strikethrough~~</td><td><strike>strikethrough</strike></td></tr><tr><td>super^script</td><td>super<sup>script</sup></td></tr></tbody></table></div></div></form>'
        this.ui.mdHelp.html(mdHelp).show()
        this.ui.mdHelpShow.hide()
        this.ui.mdHelpHide.show()
      },
      hideMdHelp: function(e) {
        e.preventDefault()
        e.stopPropagation()
        this.ui.mdHelpShow.show()
        this.ui.mdHelpHide.hide()
        this.ui.mdHelp.html('')
      },

      //so users can report spam
      reportShow: function(e) {
        e.preventDefault()
        e.stopPropagation()
          //this.$('#reportConfirm' + this.model.get('id')).toggle()
        this.ui.reportConfirm.toggle()
      },
      reportYes: function(e) {
        e.preventDefault()
        e.stopPropagation()
        this.ui.reportConfirm.hide()
        var params = {
          id: this.model.get('name'),
          uh: $.cookie('modhash')
        }
        console.log(params)

        this.api("/api/report", 'POST', params, function(data) {
          console.log("report done", data)

        });
      },
      checkIsImg: function(url) {
        return (url.match(/\.(jpeg|jpg|gif|png)$/) !== null);
      },
      fixImgur: function(url) {
        if (this.containsStr("imgur.com", url)) {
          //check if its a gallery
          if (this.containsStr("imgur.com/a", url) === true || this.containsStr("gallery", url) === true) {
            return false
          } else {
            //return url + "l.jpg"  //add l to the end of the img url to give it a better preview
            //first remove query parameters from the url
            url = url.replace(/(\?.*)|(#.*)|(&.*)/g, "")
            return url + ".jpg"
          }

        }
        return false;
      },
      containsStr: function(needle, haystack) {
        return (haystack.indexOf(needle) >= 0)
      },
      addOutboundLink: function() {
        this.$('.usertext-body a').addClass('outBoundLink').attr("data-bypass", "true"); //makes the link external to be clickable
        this.$('.usertext-body a').attr('target', '_blank');
      },

      //for live MD parsing
      keyPressComment: function(e) {
        var self = this
        var inputTxt = this.ui.userTxtInput.val()
          //this.ui.liveTextarea.html(markdown.toHTML(inputTxt) + this.blinking)

        require(['snuownd'], function(Snuownd) {

          var parsedMd = SnuOwnd.getParser().render(inputTxt);
          self.ui.liveTextarea.html(parsedMd + self.blinking)
        })

      },
      //for live MD parsing
      setupTextareaExpanding: function() {
        var self = this
        this.ui.userTxtInput.focus(function() {

          self.ui.liveTextarea.slideDown()

          self.ui.liveTextarea.html(self.ui.liveTextarea.html() + self.blinking)

        }).blur(function() {

          self.ui.liveTextarea.hide()

        });
      },

      //puts the model in a temporary space to pass it to the single page so it loads instantly
      gotoSingle: function(e) {
        var self = this
        var target = $(e.currentTarget)
        var permalink = this.model.get('permalink')
        var targetLink = target.attr('href')
        if (permalink == targetLink) {
          // console.log('it worked', this.model)
          //I've made the choice here to pass the current model as a global so we do not have to have a long load time
          //the single post page takes 2-3 seconds to load the get request
          setTimeout(function() {
            App.curModel = self.model //the small view destroys too fast and is unable to pass the model to the single
          }, 5)
          App.curModel = this.model
        }

      },
      //so users can hide a post/link 
      hidePost: function(e) {
        e.preventDefault()
        e.stopPropagation()
        var self = this
          //this.$('div[data-fullname=' + this.model.get('name') + ']').hide()
        $(this.el).hide()
        var params = {
          id: this.model.get('name'),
          uh: $.cookie('modhash')
        };
        //console.log(params)

        this.api("/api/hide", 'POST', params, function(data) {
          console.log("hide done", data)
          self.model.set('hidden', true)

        });
      },
      //so users can hide a post/link 
      savePost: function(e) {
        e.preventDefault()
        e.stopPropagation()
        if (this.checkIfLoggedIn() === true) {
          var self = this
          this.ui.save.hide()
          this.ui.unsave.show()
          var params = {
            id: this.model.get('name'),
            uh: $.cookie('modhash')
          };
          console.log(params)

          this.api("/api/save", 'POST', params, function(data) {
            console.log("save done", data)
            self.model.set('saved', true)

          });
        } else {
          this.showLoginBox()
        }
      }, //so users can hide a post/link 
      unSavePost: function(e) {
        var self = this
        e.preventDefault()
        e.stopPropagation()
        this.ui.save.show()
        this.ui.unsave.hide()
        var params = {
          id: this.model.get('name'),
          uh: $.cookie('modhash')
        };
        console.log(params)

        this.api("/api/unsave", 'POST', params, function(data) {
          console.log("unsave done", data)
          self.model.set('saved', false)

        });
      },
      youtubeChecker: function(url) {

        //TODO: this type of link not working: http://youtu.be/YEZtgWIntpA?t=1m12s
        if (this.containsStr('youtu', url) === false) {
          return false
        }
        var splitOne = url.split(/v\/|v=|youtu\.be\//)[1]

        if (typeof splitOne !== 'undefined') {
          return splitOne.split(/[?&]/)[0];
        } else {
          return false
        }

      },
      showLoginBox: function() {

        this.oauthPopup({
          path: '/login',
          callback: function() {
            window.location.reload();
          }
        });

      },

      oauthPopup: function(options) {
        //get center of page
        // Fixes dual-screen position 
        var w = 1000
        var h = 700
        var dualScreenLeft = typeof window.screenLeft !== 'undefined' ? window.screenLeft : screen.left;
        var dualScreenTop = typeof window.screenTop !== 'undefined' ? window.screenTop : screen.top;

        width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

        var left = ((width / 2) - (w / 2)) + dualScreenLeft;
        var top = ((height / 2) - (h / 2)) + dualScreenTop;

        options.windowName = options.windowName || 'Login with Reddit'; // should not include space for IE
        options.windowOptions = 'location=0,status=0,width=' + w + ',height=' + h + ',left=' + left + ',top=' + top
        var that = this;
        that._oauthWindow = window.open(options.path, options.windowName, options.windowOptions);
        that._oauthInterval = window.setInterval(function() {
          if (that._oauthWindow.closed) {
            window.clearInterval(that._oauthInterval);
            options.callback();
          }
        }, 1000);
      }
    });

  });
