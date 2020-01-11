// DEPENDENCIES
// ============
var express = require("express")
var http = require("http")
var port = process.env.PORT || 8002
var server = module.exports = express();
var fs = require("fs");
var path = require('path')
var request = require('request')
var passport = require('passport')
var crypto = require('crypto')
var RedditStrategy = require('passport-reddit').Strategy;
var device = require('express-device')

//middleware stuffs
var bodyParser = require('body-parser')
var compress = require('compression')
var cookieParser = require('cookie-parser');
var session = require('express-session')
var MongoStore = require('connect-mongo/es5')(session);

var errorHandler = require('errorhandler')
var methodOverride = require('method-override')
var favicon = require('serve-favicon');
var timestamp = require('../timestamp')

var api = require('./api')
var bots = require('./bots')

// var scope = 'modposts,identity,edit,flair,history,modconfig,modflair,modlog,modposts,modwiki,mysubreddits,privatemessages,read,report,save,submit,subscribe,vote,wikiedit,wikiread'
var scope = 'modposts,identity,edit,flair,history,mysubreddits,privatemessages,read,report,save,submit,subscribe,vote'
var callbackURL = process.env.REDDIT_CALLBACK || "https://js4.red/auth/reddit/callback"
var loginAgainMsg = 'login to reddit please'

//determines if we should serve minified CSS and Javascript to the client
var minifiedStr = process.env.NODE_ENV === 'production' ? '.min' : ''


/*
for your local env run
    export NODE_ENV='dev'
    export REDDIT_KEY = 'your key'
    export REDDIT_SECRET = 'your secret'
    export REDDIT_CALLBACK = 'http://localhost:8002/auth/reddit/callback'
    export SESSION_SECERET = 'make up some random string'

    *put these in ~/.profile so you have them on reboot
*/

var REDDIT_CONSUMER_KEY = process.env.REDDIT_KEY || 'only use these';
var REDDIT_CONSUMER_SECRET = process.env.REDDIT_SECRET || 'to use oauth';

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new RedditStrategy({
    clientID: REDDIT_CONSUMER_KEY,
    clientSecret: REDDIT_CONSUMER_SECRET,
    callbackURL: callbackURL
      //callbackURL: "http://redditjs.com/auth/reddit/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    profile.access_token = accessToken //set the recently updated access token
    profile.refresh_token = refreshToken
    profile.tokenExpires = Math.round(+new Date() / 1000) + (60 * 59) //expires one hour from now, with one minute to spare

    process.nextTick(function() {
      return done(null, profile);
    });

  }));

// SERVER CONFIGURATION
// ====================
var oneDay = 86400000;
var sessionExpireTime = 999999999
server.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
});

server.set('trust proxy', 1)
server.use(compress());
server.use(express.static(__dirname + '../../public', {
  maxAge: oneDay
}));

server.use(favicon(__dirname + '../../public/img/favicon.ico'));

if (process.env.NODE_ENV !== 'production') {

  server.use(errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
}

server.use(cookieParser(process.env.SESSION_SECRET || 'As3242g23g32hs343y346d32fg23f'));

var secureCookies = {}
var mongoOpts = {
  url: 'mongodb://localhost/redditjs-sessions'
}

if (process.env.NODE_ENV === 'production') {

  secureCookies = {
    store: new MongoStore(mongoOpts),
    proxy: true,
    saveUninitialized: false, // don't create session until something stored
    resave: false, //don't save session if unmodified
    //cookie: {
    // maxAge: sessionExpireTime,
    // secure: true
    //},
    secret: process.env.SESSION_SECRET || 'asdasdasdasd32fg23f'
  }

} else {
  //development
  secureCookies = {
    store: new MongoStore(mongoOpts),
    saveUninitialized: false, // don't create session until something stored
    resave: false, //don't save session if unmodified
    //cookie: {
    //  maxAge: sessionExpireTime
    //},
    secret: process.env.SESSION_SECRET || 'asdasdasdasd32fg23f'
  }

}

server.use(session(secureCookies));
server.use(setupLocals)
  //server.use(logger());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({
  extended: true
}));
server.use(methodOverride());
server.use(passport.initialize());
server.use(passport.session());
server.use(device.capture());
// server.use(server.router);
server.set('views', path.join(__dirname, 'views'))
server.set('view engine', 'jade')

server.get('/api', ensureAuthenticated, function(req, res) {
  api.get(res, req)
});
server.post('/api', ensureAuthenticated, function(req, res) {
  api.post(res, req)
});

server.get('/apiNonAuth', function(req, res) {
  api.getNonAuth(res, req)
});
server.post('/apiNonAuth', function(req, res) {
  api.postNonAuth(res, req)
});
server.get('/me', ensureAuthenticated, function(req, res) {
  res.json(200, req.user)

});

//requests the <title> tag of any given URL, used for the submit page
server.get('/api/getTitle', function(req, res) {
  api.getTitle(res, req)
});

//Oauth routes
//   GET /auth/reddit
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Reddit authentication will involve
//   redirecting the user to reddit.com.  After authorization, Reddit
//   will redirect the user back to this application at /auth/reddit/callback
//
//   Note that the 'state' option is a Reddit-specific requirement.
server.get('/login', function(req, res, next) {
  req.session.state = crypto.randomBytes(32).toString('hex');

  passport.authenticate('reddit', {
    state: req.session.state,
    //authorizationURL: 'https://ssl.reddit.com/api/v1/authorize.compact',
    scope: scope,
    duration: 'permanent' //permanent or temporary
      //duration: 'temporary' //permanent or temporary
  })(req, res, next);
});

server.get('/logout', function(req, res, next) {
  req.session.destroy();
  req.logout()
  res.send(200, "ok")
});

//reddit Oauth docs: https://github.com/reddit/reddit/wiki/OAuth2
server.get('/auth/reddit/callback', function(req, res, next) {
  // Check for origin via state token

  if (req.query.state == req.session.state) {

    req.session.code = req.query.code
      //request users info at: https://oauth.reddit.com/api/v1/me.json
    passport.authenticate('reddit', {
      successRedirect: '/redirectBack',
      failureRedirect: '/login'
    })(req, res, next);
  } else {

    next(new Error('There was a problem connecting to the reddit server.  Please try again'));
  }
});

server.get("/redirectBack", function(req, res) {
  delete req.session.state;
  res.render('index', {
    user: req.user || false //bootstrap user to client if they are logged in
  })

});

//redirect to non-www
server.all('/*', function(req, res, next) {
  if (req.headers.host.match(/^www/) !== null) {
    res.redirect('http://' + req.headers.host.replace(/^www\./, '') + req.url);
  } else {
    next();
  }
})

//handles all other requests to the backbone router
server.get("*", function(req, res) {

  if (req.device.type === 'bot') {
    bots.fetchForBot(res, req)
  } else {
    res.render('index', {
      user: req.user || false, //bootstrap user to client if they are logged in
      customCss: (req.path == '/embed' && req.query.customCss) || false
    })
  }

});

http.createServer(server).listen(port);

console.log('\nWelcome to redditjs.com!, running on port: ' + port + ' in with NODE_ENV: ' + process.env.NODE_ENV);

function ensureAuthenticated(req, res, next) {

  if (req.isAuthenticated()) {

    refreshToken(req, res, function(isExpired) {
      if (isExpired === true) {
        return next();
      } else {
        res.send(419, loginAgainMsg)
      }
    })

  } else {
    res.send(419, loginAgainMsg)

  }

}

function setupLocals(req, res, next) {
  res.locals.timestamp = timestamp.timestamp //saves the last time we ran grunt
  res.locals.minifiedStr = minifiedStr
  next()
}

function refreshToken(req, res, next) {
  var now = Math.round(+new Date() / 1000)

  if (now < req.user.tokenExpires) {
    //console.log('token is NOT expired')
    return next(true)
  } else {
    //console.log('token is expired, lets refresh!', req.user.name)

    var authorization = "Basic " + Buffer("" + REDDIT_CONSUMER_KEY + ":" + REDDIT_CONSUMER_SECRET).toString('base64');

    var params = {
      "client_id": REDDIT_CONSUMER_KEY,
      "client_secret": REDDIT_CONSUMER_SECRET,
      "grant_type": 'refresh_token',
      "refresh_token": req.user.refresh_token,
      'scope': scope,
      'duration': 'permanent',
      "redirect_uri": callbackURL

    }

    var options = {
      'Content-Type': 'application/x-www-form-urlencoded',
      url: 'https://ssl.reddit.com/api/v1/access_token?',
      headers: {
        'User-Agent': 'RedditJS/1.0 by ' + req.user.name,
        'Authorization': authorization
      },
      form: params,
    };

    request.post(options, function(error, response, body) {
      if (error) {

        res.send(419, loginAgainMsg)
        return
      } else if (!error && response.statusCode == 200 || response.statusCode == 304) {
        //set a new access token after getting a new one
        var values = JSON.parse(body)

        values.tokenExpires = (now + values.expires_in) - 60 //give it 60 seconds grace time

        if (values !== 'undefined' && typeof values.access_token !== 'undefined' && values.access_token.length > 3) { //return value cant be trusted
          req.user.tokenExpires = values.tokenExpires
          req.user.access_token = values.access_token

          process.nextTick(function() { //wait for the access token to be in the DB
            return next(true)
          });
        } else {
          res.send(419, loginAgainMsg)
        }

      } else {
        res.send(419, loginAgainMsg)
      }

    });

  }

}
