define(['App', 'jquery', 'underscore', 'backbone', 'hbs!template/oauth', 'view/login-view', 'model/user-about', 'cookie'],
  function(App, $, _, Backbone, Tmpl, LoginView, UserModel, cookie) {
    return LoginView.extend({
      template: Tmpl,
      events: {
        'submit #login_reg': 'register',
        'click .capimage': 'getNewCaptcha',
        'click .hidecover': 'hide',
        'submit #login_login': 'doLogin'
      },
      initialize: function(data) {
        _.bindAll(this);

        App.on("login", this.loginSuccess, this);
      },
      onRender: function() {
        //console.log('rendering oauth popup')
      },

      doLogin: function(e) {
        e.preventDefault()
        e.stopPropagation()
        this.login()

      },
      hide: function(e) {
        e.preventDefault()
        e.stopPropagation()

        this.$el.empty()
      },

      loginSuccess: function() {
        var self = this
        this.$el.empty()
        var curHash = Backbone.history.fragment
        Backbone.history.navigate('redirectAfterLogin'); //have to redirect to a fake link before we goback to where the user wants to go
        Backbone.history.navigate(curHash, {
          trigger: true

        })

      }

    });
  });
