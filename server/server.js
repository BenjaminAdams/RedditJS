// DEPENDENCIES
// ============
var express = require("express")
var http = require("http")
var port = (process.env.PORT || 8002)
var server = module.exports = express();
var fs = require("fs");
var path = require('path')
var request = require('request')
var passport = require('passport')
var crypto = require('crypto')
var db = require('./db').getDB()
//var connect = require('connect');
//var SessionStore = require("session-mongoose")(connect);
var MongoStore = require('connect-mongo')(express);

//store: new mongoStore({ host: 'session_server', port: 27017, db: 'seesion', collection: 'sessions' })
var store = new MongoStore({
    //db: db,
    db: 'sessions',
    auto_reconnect: true,
    stringify: false
});

// var scope = 'modposts,identity,edit,flair,history,modconfig,modflair,modlog,modposts,modwiki,mysubreddits,privatemessages,read,report,save,submit,subscribe,vote,wikiedit,wikiread'
var scope = 'modposts,identity,edit,flair,history,mysubreddits,privatemessages,read,report,save,submit,subscribe,vote'
var callbackURL = "http://localhost:8002/auth/reddit/callback"
var loginAgainMsg = 'login to reddit please'

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

var UserDB = require('./models/user')
var api = require('./api')
//var oauth = require('./oauth')

passport.serializeUser(function(user, done) {
    done(null, user);
    //done(null, user._id);
});

passport.deserializeUser(function(User, done) {

    UserDB.findOne({
        name: User.name
    }, function(err, user) {
        done(err, user);
    });
});

passport.use(new RedditStrategy({
        clientID: REDDIT_CONSUMER_KEY,
        clientSecret: REDDIT_CONSUMER_SECRET,
        callbackURL: callbackURL
        //callbackURL: "http://redditjs.com/auth/reddit/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        //console.log('profile=', profile)
        profile.token = accessToken //set the recently updated access token
        profile.refreshToken = refreshToken
        profile.tokenExpires = Math.round(+new Date() / 1000) + (60 * 59) //expires one hour from now, with one minute to spare

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

    server.use(express.cookieParser(process.env.SESSION_SECRET || 'asdasdasdasd32fg23f'));
    // server.use(express.session({
    // secret: process.env.SESSION_SECRET || 'asdasdasdasd32fg23f'  //using sessions in memory
    // }));

    // configure session provider with mongodb
    server.use(express.session({
        store: store,
        secret: process.env.SESSION_SECRET || 'asdasdasdasd32fg23f',
        cookie: {
            maxAge: 99999999999
        }
    }));
    //server.use(express.logger());
    server.use(express.bodyParser());
    server.use(express.methodOverride());
    server.use(passport.initialize());
    server.use(passport.session());
    server.use(server.router);
    server.set('views', path.join(__dirname, 'views'))
    server.set('view engine', 'jade')

});

server.get('/api', ensureAuthenticated, function(req, res) {

    api.get(res, req)
});

server.get('/me', ensureAuthenticated, function(req, res) {
    req.session.user.tokenExpires = 0
    UserDB.findOne({
        name: req.user.name
    }, function(err, user) {
        if (err) {
            res.send(419, err)
        }
        res.json(200, user)
    });
});

server.post('/api', ensureAuthenticated, function(req, res) {
    api.post(res, req)
});

//requests the <title> tag of any given URL, used for the submit page
server.get('/api/getTitle', function(req, res) {
    api.getTitle(res, req)
});

server.get("/whoami", ensureAuthenticated, function(req, res) {
    console.log('req.user=', req.user)
    res.json(req.user)
});

//Oauth routes
// GET /auth/reddit
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
            successRedirect: '/redirectBack',
            failureRedirect: '/login'
        })(req, res, next);
    } else {
        next(new Error(403));
    }
});

//handles all other requests to the backbone router
server.get("*", function(req, res) {
    console.log(req.user)
    if (req.user) {
        //logged in user
        res.render('index', {
            user: req.user
        })
    } else {
        //user not logged in
        res.render('index')
    }

    //fs.createReadStream(__dirname + "/../public/index.html").pipe(res);
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
    // res.send(419, loginAgainMsg)
    //if (true) {
    if (req.isAuthenticated()) {

        refreshToken(req, res, function(isExpired) {
            if (isExpired === true) {
                return next();
            } else {
                res.send(419, loginAgainMsg)
            }
        })

    } else {
        console.log(req.session)
        res.send(419, loginAgainMsg)
        //res.redirect('/login'); 
    }

}

function refreshToken(req, res, next) {
    var now = Math.round(+new Date() / 1000)

    //  res.send(419, loginAgainMsg)

    if (now < req.user.tokenExpires) {
        //if (false) {
        console.log('token is NOT expired')
        return next(true)
    } else {
        console.log('token is expired, lets refresh!')

        var authorization = "Basic " + Buffer("" + REDDIT_CONSUMER_KEY + ":" + REDDIT_CONSUMER_SECRET).toString('base64');

        var params = {
            "client_id": REDDIT_CONSUMER_KEY,
            "client_secret": REDDIT_CONSUMER_SECRET,
            "grant_type": 'refresh_token',
            "refresh_token": req.user.refreshToken,
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
            //console.log('resp=', response)
            if (error) {
                res.send(419, loginAgainMsg)
                return
            } else if (!error && response.statusCode == 200 || response.statusCode == 304) {

                // res.json(JSON.parse(body))

                //set a new access token

                console.log(JSON.parse(body))
                //res.json(JSON.parse(body))

                var values = JSON.parse(body)

                values.tokenExpires = (now + values.expires_in) - 60 //give it 60 seconds grace time

                console.log('updating refresh token user=', req.user, values)

                UserDB.update({
                    name: req.user.name
                }, values, {
                    upsert: true
                }, function(err, usr) {

                    if (err) {
                        console.log('error saving user=', err)
                        res.send(419, loginAgainMsg)
                        next(false)
                    }

                    // req.session = usr
                    req.session.user.tokenExpires = values.tokenExpires
                    req.session.user.token = values.access_token

                    console.log('SESSION', req.session)

                    process.nextTick(function() { //wait for the access token to be in the DB
                        return next(true)
                    });

                });

            } else {
                res.send(419, loginAgainMsg)
            }

        });

    }

}