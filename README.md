##RedditJS.com
The code that powers <http://RedditJS.com/>

#Features
 * Data Cache:  Only have to load up the subreddit once.  Once the subreddit is loaded, it will pull the subreddit/single post from memory. (Benefit for both Reddit's server and you!  Only fetch once.)
 * Unique Views:  View an entire subreddit in a new way.  View thumbnails only, full images, and large grid mode.  (more to come)


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
 * jQuery <http://jquery.com/>
 * Reddit API <http://www.reddit.com/dev/api/>


RESThub Backbone stack documentation <http://resthub.org/2/backbone-stack.html>

