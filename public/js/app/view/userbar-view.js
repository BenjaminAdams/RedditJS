define(['App', 'jquery', 'underscore', 'backbone', 'hbs!template/userbar', 'view/basem-view', 'model/user-about', 'model/me', 'hbs!template/userbar-mobile', 'cookie'],
  function(App, $, _, Backbone, UserbarTmpl, BaseView, UserModel, MeModel, MobileUserbarTmpl, Cookie) {
    return BaseView.extend({
      template: UserbarTmpl,
      events: {
        'click .logout': 'logout',
        'click #userbar-logged-out': 'showOathLogin',
        'click #signInUserbar': 'showOathLogin'
      },
      ui: {
        'loggedIn': '#loggedIn',
        'loggedOut': '#loggedOut',
        'mail': '#mail'
      },

      initialize: function(data) {
        _.bindAll(this);
        var self = this

        if (data.mobile === true) {
          this.template = MobileUserbarTmpl
          this.tagName = 'span'
        }

        if (this.checkIfLoggedIn() === true) {
          this.model = new UserModel(App.user);

          console.log('model=', this.model)
        }
        this.listenTo(App, 'oauth:showPopup', this.showLoginBox)

      },
      onRender: function() {
        var self = this
        if (this.checkIfLoggedIn() === true) {
          this.ui.loggedOut.hide()
          this.ui.loggedIn.show()

          //wait 1.5 seconds to check mail
          setTimeout(function() {
            self.meModel = new MeModel();

            self.meModel.fetch({
              success: function(model) {
                if (model.get('has_mail') === true) {
                  self.ui.mail.addClass('havemail').removeClass('nohavemail')
                  self.ui.mail.attr('title', 'You\'ve got mail!')
                  self.ui.mail.attr('alt', 'You\'ve got mail!')
                  self.ui.mail.attr('href', '/message/unread/')
                }

              }
            })
          }, 1500)

        } else {
          this.showLoggedOut()
        }

        if (window.production === false) {
          var str = '<a class="pref-lang" href="/test" title="test"><i class="fa fa-truck"></i></a>'
          this.ui.mail.before(str)
        }
      },

      showOathLogin: function() {
        console.log('show oath login form')
        this.showLoginBox()
      },

      showLoggedOut: function() {        
        this.ui.loggedOut.show()
        this.ui.loggedIn.hide()          
      },
      //log user out, delete server side session and client side cookies
      logout: function(e) {
        e.preventDefault()
        e.stopPropagation()
        App.trigger("logout");
        this.showLoggedOut()
        App.user = false        
        $.get("/logout");
        window.localStorage.removeItem('subreddits');
      }
    });

  });
