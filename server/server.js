// DEPENDENCIES
// ============
var express = require("express")
var http = require("http")
var port = (process.env.PORT || 8002)
var server = module.exports = express();
var fs = require("fs");
var passport = require('passport')
crypto = require('crypto')
var RedditStrategy = require('passport-reddit').Strategy;

/*how to add heroku config variables
heroku config:add REDDIT_KEY=
heroku config:add REDDIT_SECRET=


*/

var REDDIT_CONSUMER_KEY = "--insert-reddit-consumer-key-here--";
var REDDIT_CONSUMER_SECRET = "--insert-reddit-consumer-secret-here--";

console.log('env=', process.env.REDDIT_KEY)

var api = require('./api')
var oauth = require('./oauth')

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

    server.use(express.bodyParser());
    server.use(server.router);

    passport.use(new RedditStrategy({
            clientID: REDDIT_CONSUMER_KEY,
            clientSecret: REDDIT_CONSUMER_SECRET,
            callbackURL: "http://127.0.0.1:3000/auth/reddit/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            User.findOrCreate({
                redditId: profile.id
            }, function(err, user) {
                return done(err, user);
            });
        }
    ));

});

server.get('/api', function(req, res) {
    api.get(res, req)
});
server.post('/api', function(req, res) {
    api.post(res, req)
});

server.get('/api/getTitle', function(req, res) {
    api.getTitle(res, req)
});

//handles all other requests to the backbone router
server.get("*", function(req, res) {
    fs.createReadStream(__dirname + "/../public/index.html").pipe(res);
});

// SERVER
// ======

// Start Node.js Server
http.createServer(server).listen(port);

console.log('\nWelcome to redditjs.com!\nPlease go to http://localhost:' + port + ' to start using RedditJS');

if (process.env.NODE_ENV === 'production') {
    var nullfun = function() {};
    console.log = nullfun;
    console.info = nullfun;
    console.error = nullfun;
    console.warn = nullfun;
}