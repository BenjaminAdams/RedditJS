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
var RedditStrategy = require('passport-reddit').Strategy;

//middleware stuffs
var bodyParser = require('body-parser')
var compress = require('compression')
var cookieParser = require('cookie-parser');
var session = require('express-session')
var errorHandler = require('errorhandler')
var methodOverride = require('method-override')
var favicon = require('serve-favicon');

var api = require('./api')
var redisStore = require('connect-redis')(session);

// var scope = 'modposts,identity,edit,flair,history,modconfig,modflair,modlog,modposts,modwiki,mysubreddits,privatemessages,read,report,save,submit,subscribe,vote,wikiedit,wikiread'
var scope = 'modposts,identity,edit,flair,history,mysubreddits,privatemessages,read,report,save,submit,subscribe,vote'
var callbackURL = process.env.REDDIT_CALLBACK || "http://redditjs.com/auth/reddit/callback"
var loginAgainMsg = 'login to reddit please'
    /*
for your local env run
    export REDDIT_KEY = 'your key'
    export REDDIT_SECRET = 'your secret'
    export REDDIT_CALLBACK = 'http://localhost:8002/auth/reddit/callback'
    export SESSION_SECERET = 'make up some random string'
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
        //console.log('profile=', profile)
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
// server.use(function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     res.header('Access-Control-Allow-Headers', 'Content-Type');

//     next();
// });

server.use(compress());

server.use(express.static(__dirname + '../../public'));

server.use(favicon(__dirname + "/../public/img/favicon.ico"));

if (process.env.NODE_ENV !== 'production') {

    server.use(errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
}

server.use(cookieParser(process.env.SESSION_SECRET || 'asdasdasdasd32fg23f'));
server.use(session({
    store: new redisStore(),
    cookie: {
        maxAge: 36000000
    },
    secret: process.env.SESSION_SECRET || 'asdasdasdasd32fg23f'
}));

//server.use(logger());
server.use(bodyParser());
server.use(methodOverride());
server.use(passport.initialize());
server.use(passport.session());
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
    console.log('getting title')
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
        next(new Error(403));
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
    res.render('index', {
        user: req.user || false //bootstrap user to client if they are logged in
    })
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
        //console.log('token is NOT expired')
        return next(true)
    } else {
        console.log('token is expired, lets refresh!')

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
                //set a new access token
                console.log(JSON.parse(body))
                var values = JSON.parse(body)

                values.tokenExpires = (now + values.expires_in) - 60 //give it 60 seconds grace time

                //req.session.tokenExpires = values.tokenExpires
                //req.session.access_token = values.access_token
                req.user.tokenExpires = values.tokenExpires
                req.user.access_token = values.access_token

                process.nextTick(function() { //wait for the access token to be in the DB
                    return next(true)
                });

            } else {
                res.send(419, loginAgainMsg)
            }

        });

    }

}