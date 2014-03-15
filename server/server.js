// DEPENDENCIES
// ============
var express = require("express")
var http = require("http")
var port = (process.env.PORT || 8002)
var server = module.exports = express();
var fs = require("fs");
var passport = require('passport')
var crypto = require('crypto')
var RedditStrategy = require('passport-reddit').Strategy;
var REDDIT_CONSUMER_KEY = process.env.REDDIT_KEY;
var REDDIT_CONSUMER_SECRET = process.env.REDDIT_SECRET;

/*
//reddit Oauth docs: https://github.com/reddit/reddit/wiki/OAuth2
how to add heroku config variables for heroku
    heroku config:add REDDIT_KEY='your key'
    heroku config:add REDDIT_SECRET='your secret'
    heroku config:add SESSION_SECERET='make up some random string'
for your local env run
    export REDDIT_KEY='your key'
    export REDDIT_SECRET='your secret'
    export SESSION_SECERET='make up some random string'
*/
var db = require('./db').getDB()
var UserDB = require('./models/user')
var api = require('./api')
//var oauth = require('./oauth')

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(id, done) {
    UserDB.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new RedditStrategy({
        clientID: REDDIT_CONSUMER_KEY,
        clientSecret: REDDIT_CONSUMER_SECRET,
        callbackURL: "http://localhost:8002/auth/reddit/callback"
        //callbackURL: "http://redditjs.com/auth/reddit/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        //console.log('profile=', profile)
        profile.token = accessToken //set the recently updated access token

        UserDB.update({
            name: profile.name
        }, profile, {
            upsert: true
        }, function(err, usr) {

            if (err) {
                console.log('error=', err)
            }

            console.log('usr=', usr)

            process.nextTick(function() {
                // To keep the example simple, the user's Reddit profile is returned to
                // represent the logged-in user.  In a typical application, you would want
                // to associate the Reddit account with a user record in your database,
                // and return that user instead.

                return done(null, profile);
            });
        });

    }));

// SERVER CONFIGURATION
// ====================
server.configure(function() {
    var oneDay = 86400000;
    server.use(express.compress());
    server.use(express.static(__dirname + "/../public", {
        maxAge: oneDay
    }));
    server.use(express.favicon(__dirname + "/../public/img/favicon.ico"));

    if (process.env.NODE_ENV !== 'production') {

        server.use(express.errorHandler({
            dumpExceptions: true,
            showStack: true
        }));
    }

    server.use(express.cookieParser());
    server.use(express.session({
        secret: process.env.SESSION_SECRET
    }));
    server.use(express.logger());
    server.use(express.bodyParser());
    server.use(express.methodOverride());
    server.use(passport.initialize());
    server.use(passport.session());

    server.use(server.router);

});

server.get('/api', function(req, res) {
    api.get(res, req)
});
server.post('/api', function(req, res) {
    api.post(res, req)
});

//requests the <title> tag of any given URL, used for the submit page
server.get('/api/getTitle', function(req, res) {
    api.getTitle(res, req)
});

//Oauth routes
// GET /auth/reddit
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Reddit authentication will involve
//   redirecting the user to reddit.com.  After authorization, Reddit
//   will redirect the user back to this application at /auth/reddit/callback
//
//   Note that the 'state' option is a Reddit-specific requirement.
server.get('/auth/reddit', function(req, res, next) {
    req.session.state = crypto.randomBytes(32).toString('hex');
    passport.authenticate('reddit', {
        state: req.session.state,
        duration: 'permanent' //permanent or temporary
    })(req, res, next);
});

// GET /auth/reddit/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
server.get('/auth/reddit/callback', function(req, res, next) {
    // Check for origin via state token
    console.log('got callback from reddit...req.query=', req.query)
    if (req.query.state == req.session.state) {

        req.session.code = req.query.code
        //request users info at: https://oauth.reddit.com/api/v1/me.json

        //  api.oauthGet(res, req)

        passport.authenticate('reddit', {
            successRedirect: '/',
            //failureRedirect: '/login'
            failureRedirect: '/auth/reddit'
        })(req, res, next);
    } else {
        next(new Error(403));
    }
});

//handles all other requests to the backbone router
server.get("*", function(req, res) {

    //console.log('user=', passport)

    passport.serializeUser(null, function(user) {
        console.log('user=', user)
    })

    fs.createReadStream(__dirname + "/../public/index.html").pipe(res);
});

// SERVER
// ======

// Start Node.js Server
http.createServer(server).listen(port);

console.log('\nWelcome to redditjs.com!\nPlease go to http://localhost:' + port + ' to start using RedditJS');

// if (process.env.NODE_ENV === 'production') {
//     var nullfun = function() {};
//     console.log = nullfun;
//     console.info = nullfun;
//     console.error = nullfun;
//     console.warn = nullfun;
// }

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}