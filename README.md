##RedditJS
The code that powers [redditJS.com](http://www.redditjs.com).

I rewrote reddit from the ground up using the javascript framework [Backbone](https://github.com/jashkenas/backbone) and the [reddit API](http://www.reddit.com/dev/api/).  I feel that I've created a better user experience as well as additional features that makes for a more enjoyable experience.  Follow updates at [/r/redditjs_meow](http://www.reddit.com/r/redditjs_meow/).

#Features
 * **Data Cache:**  Only have to load up the subreddit once.  Once the subreddit is loaded, it will pull the subreddit/single post from memory. (Benefit for both Reddit's server and you!  Only fetch once.)
 * **Unique Views:**  View an entire subreddit in a new way.  View thumbnails only, full images, and large grid mode.  (more to come)
 * **Do everything:** you normally can on Reddit(*almost everything).  Vote/save/hide posts.  Comment, Mail, Search all without having to refresh your browser.
 * **Bottom Bar:** On single post views, you can see a bottom bar that contains all of the posts from that subreddit.  If you don't have that subreddit in memory yet, it caches it for later use too. (Faster browsing back to that subreddit in the future).  When the bottom bar is not active, it remains at only 20% visibility so you can hardly tell that it's there.  I have found that navigating through reddit this way to be more enjoyable.
 * **Custom CSS:** Subreddit may have custom CSS and flair that goes with them, [redditJS](http://www.redditjs.com) uses them!
 * **Comment Links:** If you hover over a link to an image or Youtube video, it becomes fullsize inside of the comment box.  (Future plans to be able to add MEME text to this image right from the image)
 * **Permalink Comments:** If you visit a link to a permalink of a comment in Reddit it only shows that comment, I've always found this annoying.  RedditJS will show that linked comment first and all of the comments from that post in the thread
 * **Keyboard Navigation:** Use the left and right arrow keys to navigate between posts
 * **Subreddit Dropdown Menu:** I've turned the top left subreddit dropdown menu to graphical subreddit selection with logo's instead of a list of their names.  


####RedditJS is built with :
 * Node.js <http://nodejs.org/>
 * Backbone.js <https://github.com/jashkenas/backbone>
 * Underscore.js <https://github.com/jashkenas/underscore>
 * Require.js <http://requirejs.org/>
 * Handlebars <http://handlebarsjs.com/>
 * jQuery <http://jquery.com/>
 * Reddit API <http://www.reddit.com/dev/api/>
 * Hosted at [Heroku](https://www.heroku.com)

#### How to run this locally
 * Clone repo `git clone git@github.com:BenjaminAdams/RedditJS.git`
 * In the console type `npm install`
 * In /public/js/loader.js you may have to change the window.production = false or else the changes you make to the source will not work.
 * You may need to do `sudo npm -g install nodemon`
 * Run the project and watch for live changes to the code type `nodemon` and you should be able to open it in http://localhost:8002/ 
 * To minify the code for production type `grunt` and in /public/js/loader.js change window.production = true and it will load the minified source.


#### Thanks
[Hire me to build your next webapp](mailto:armastevs@gmail.com)
