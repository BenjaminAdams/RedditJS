##RedditJS
The code that powers [redditJS.com](http://www.redditjs.com)

#Features
 * **Data Cache:**  Only have to load up the subreddit once.  Once the subreddit is loaded, it will pull the subreddit/single post from memory. (Benefit for both Reddit's server and you!  Only fetch once.)
 * **Unique Views:**  View an entire subreddit in a new way.  View thumbnails only, full images, and large grid mode.  (more to come)
 * **Do everything:** you normally can on Reddit(*almost everything).  Vote/save/hide posts.  Comment, Mail, Search all without having to refresh your browser.
 * **Bottom Bar:** On single post views, you can see a bottom bar that contains all of the posts from that subreddit.  If you don't have that subreddit in memory yet, it caches it for later use too. (Faster browsing back to that subreddit in the future).  When the bottom bar is not active, it remains at only 20% visibility so you can hardly tell that it's there.  I have found that navigating through reddit this way to be more enjoyable.
 * **Custom CSS:** Subreddit may have custom CSS and flair that goes with them, [redditJS](http://www.redditjs.com) uses them!
 * **Comment Links:** If you hover over a link to an image or Youtube video, it becomes fullsize inside of the comment box.  (Future plans to be able to add MEME text to this image right from the image)

####How to build with the r.js optimizer

From the js/build folder

```js
node r.js -o build-config.js
```

It then creates the output in the `target` folder



####RedditJS is built with :
 * Backbone.js <https://github.com/jashkenas/backbone>
 * Underscore.js <https://github.com/jashkenas/underscore>
 * Require.js <http://requirejs.org/>
 * Handlebars <http://handlebarsjs.com/>
 * jQuery <http://jquery.com/>
 * Reddit API <http://www.reddit.com/dev/api/>
 * Resthub <http://resthub.org/2/backbone-stack.html>

#### Thanks
[Hire me to build your next webapp](mailto:armastevs@gmail.com)
