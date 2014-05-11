##RedditJS
The code that powers [redditJS.com](http://www.redditjs.com).

I rewrote reddit from the ground up using the javascript framework [Backbone](https://github.com/jashkenas/backbone) and the [reddit API](http://www.reddit.com/dev/api/).  I feel that I've created a better user experience as well as additional features that makes for a more enjoyable experience.  Follow updates at [/r/redditjs](http://www.reddit.com/r/redditjs).

#Features
 * **Data Cache:**  Only have to load up the subreddit once.  Once the subreddit is loaded, it will pull the subreddit/single post from memory. (Benefit for both Reddit's server and you!  Only fetch once.)
 * **Unique Views:**  View an entire subreddit in a new way.  View thumbnails only, full images, and large grid mode.  (more to come)
 * **Do everything:** you normally can on Reddit(*almost everything).  Vote/save/hide posts.  Comment, Mail, Search all without having to refresh your browser.
 * **Bottom Bar:** On single post views, you can see a bottom bar that contains all of the posts from that subreddit.  If you don't have that subreddit in memory yet, it caches it for later use too. (Faster browsing back to that subreddit in the future).  When the bottom bar is not active, it remains at only 20% visibility so you can hardly tell that it's there.  I have found that navigating through reddit this way to be more enjoyable.
 * **Custom CSS:** Subreddit may have custom CSS and flair that goes with them, [redditJS](http://www.redditjs.com) uses them!
 * **Comment Links:** If you hover over a link to an image or Youtube video, it becomes fullsize inside of the comment box.  (Future plans to be able to add MEME text to this image right from the image)
 * **Permalink Comments:** If you visit a link to a permalink of a comment in Reddit it only shows that comment, I've always found this annoying.  RedditJS will show that linked comment first and all of the comments from that post in the thread
 * **Keyboard Navigation:** Use the left and right arrow keys to navigate between posts
 * **Subreddit Explorer:** I've turned the top left subreddit dropdown menu into a list of subreddits based on category.  There are currently about 1,000 subreddits listed here.  It helps you discover new subreddits and waist even more time on reddit!
 * **Download Images:** Download all images and compress them into a zip.  Done all on the client side. [example](http://www.redditjs.com/download/aww)

####RedditJS is built with :
 * Node.js <http://nodejs.org/>
 * Backbone.js <https://github.com/jashkenas/backbone>
 * Underscore.js <https://github.com/jashkenas/underscore>
 * Require.js <http://requirejs.org/>
 * Handlebars <http://handlebarsjs.com/>
 * jQuery <http://jquery.com/>
 * Reddit API <http://www.reddit.com/dev/api/>
 * Hosted at [Digital Ocean]( https://www.digitalocean.com/?refcode=572549c85ce0)

#### How to run this locally
 * Clone repo `git clone git@github.com:BenjaminAdams/RedditJS.git`
 * In the console type `npm install`
 * `sudo npm -g install nodemon` This starts the node server and monitors for changes in the files and updates the code running on node.
 * Run the project and watch for live changes to the code type `nodemon` and you should be able to open it in http://localhost:8002/ 
 * To minify the code for production type `grunt` which creates `styles.min.css` and `DesktopInit.min.js`
 * If are not seeing changes you make live, you may need to change /server/views/jade to have `script(src='/js/app/init/DesktopInit.min.js')` to `script(src='/js/app/init/DesktopInit.js')` also change link`(rel='stylesheet', href='/css/styles.min.css')` to `link(rel='stylesheet', href='/css/styles.css')`

#### How to setup oauth
* Have a local redis instance (http://redis.io/ - sudo apt-get install redis-server)
* Create an app with your reddit account - https://ssl.reddit.com/prefs/apps/
* Set your apps redirect url to 'http://mypublicip:8002/auth/reddit/callback', where mypublicip is your ip
* Setup your environment to use these:

Via command line, and also put at bottom of ~/.profile to keep set on system restart
```
    export REDDIT_KEY = 'your key'
    export REDDIT_SECRET = 'your secret'
    export REDDIT_CALLBACK = 'http://localhost:8002/auth/reddit/callback'
    export SESSION_SECERET = 'make up some random string'
```

#### Thanks
[Hire me to build your next webapp](mailto:armastevs@gmail.com)
