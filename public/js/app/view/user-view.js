define(['App', 'underscore', 'backbone', 'hbs!template/user', 'view/subreddit-view', 'collection/user', 'cView/user', 'view/post-row-view'],
  function(App, _, Backbone, UserTmpl, SubredditView, UserCollection, UserCView, PostRowView) {
    return SubredditView.extend({
      template: UserTmpl,
      className: 'userView',
      events: {
        'click .dropdown-user': 'toggleDropdown'
      },
      serializeData: function() {
        return {
          username: this.username,
          sortOrder: this.sortOrder
        }
      },

      initialize: function(options) {
        _.bindAll(this);
        var self = this;
        this.username = options.username
        this.sortOrder = options.sortOrder

        if (typeof this.sortOrder === 'undefined') {
          this.sortOrder = 'new'
        }

        this.collection = new UserCollection(null, {
          username: this.username,
          sortOrder: this.sortOrder
        });

        $(window).on("scroll", this.watchScroll);

        this.target = $(window); //the target to test for infinite scroll
        this.loading = false;
        this.scrollOffset = 1000;
        this.prevScrollY = 0; //makes sure you are not checking when the user scrolls upwards
        this.errorRetries = 0; //keeps track of how many errors we will retry after
      },
      onShow: function() {
        this.siteTableContainer.show(new UserCView({
          collection: this.collection,
        }))
        this.fetchMore()

        $(this.el).append("<div class='loading'> </div>")

      },

      toggleDropdown: function() {
        this.$('.drop-choices-user').toggle()
      },

      gotNewPosts: function(models, res) {
        this.$('.loading').hide()

        if (typeof res.data.children.length === 'undefined') {
          return; //we might have an undefined length?
        }

        //fetch more  posts with the After
        if (this.collection.after === "stop") {
          console.log("AFTER = stop")
          $(window).off("scroll", this.watchScroll);
        }
        this.loading = false; //turn the flag on to go ahead and fetch more!
        this.helpFillUpScreen()

      }

    });

  });
