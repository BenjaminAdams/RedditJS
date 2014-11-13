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
 * **[Widget embed codes](http://embed.redditjs.com):**  for reddit posts or subreddits details and examples below.
 * **Same Styles everywhere:** Option to use the same CSS styles from one subreddit all over reddit. I did this so I could use [murica](http://redditjs.com/r/murica) everywhere.

####RedditJS is built with :
 * Node.js <http://nodejs.org/>
 * Backbone.js <https://github.com/jashkenas/backbone>
 * Marionette.js <http://marionettejs.com>
 * Underscore.js <https://github.com/jashkenas/underscore>
 * Require.js <http://requirejs.org/>
 * Handlebars <http://handlebarsjs.com/>
 * jQuery <http://jquery.com/>
 * Reddit API <http://www.reddit.com/dev/api/>
 * Hosted at [Digital Ocean]( https://www.digitalocean.com/?refcode=572549c85ce0)

#### Post embed widget
You can add this script tag to any website.  The post widget will embed itself onto your Wordpress post and detect if it has been posted to reddit.   [details and examples](http://embed.redditjs.com)

```<script src='//redditjs.com/post.js' </script>```

If it has NOT been posted to reddit it will show a link to encourage the user to submit.
![no reddit post found](http://i.imgur.com/OLJjzkx.png)

If it has been posted, it will load a widget displaying that reddit post giving the user where they can upvote/comment that post.

![Post found](http://i.imgur.com/GXj1FKO.png)

This is excellent for websites that have their content submitted to reddit.  It will help increase reddit activity with more upvotes and comments and allow the user to freely navigate reddit.

## Instructions

You can add the script tag to any website, or you can use the [Reddit Embed Wordpress Plugin](https://github.com/BenjaminAdams/wp-redditjs) to create widgets to embed on your website.


##### Options

<table style='width:800px'>
<tr><th style='width:125px;'>Name</th><th>Description</th> <th>values</th> </tr>
<tr><td>data-url</td><td>The URL you want to search in reddit to embed on your site, or you can put a reddit post id. If the url is http://www.reddit.com/r/technology/comments/2m2yl7/its_now_official_humanity_has_landed_a_probe_on_a/ the post id would be 2m2yl7 *defaults to current URL of your website.</td> <td>any url or reddit post id</td>  </tr>
<tr><td>data-width</td><td>Width of the post widget.</td> <td>number</td>  </tr>
<tr><td>data-height</td><td>Height of the post widget.</td> <td>number</td>  </tr>
<tr><td>data-post-finder</td><td>If the URL has been submitted multiple times to reddit, it will display the most relevant post based on your setting.</td> <td>newest, mostUpvoted, mostComments</td>  </tr>
<tr><td>data-theme</td><td>Change the theme</td> <td>light, dark </td></tr>
<tr><td>data-show-submit</td><td>If we don't find a post on reddit, should we display a "submit to reddit" widget.</td> <td>true,false</td>  </tr>
</table>

##### example with options

```
<script src='//redditjs.com/post.js' data-url='http://www.techodrom.com/etc/star-trek-edges-closer-reality-tractor-beam-moves-object-using-nothing-power-ultrasound/' data-height='500' data-width='500' data-post-finder='newest' data-theme='dark' data-show-submit='true'  </script>
```


####Subreddit embed widget

#####Instructions
Add this script tag where you want the subreddit widget to appear.


```<script src='//redditjs.com/subreddit.js'></script>```

<h3>Options</h3>
All of these options are optional.

<table style='width:800px'>
<tr><th style='width:125px;'>Name</th><th>Description</th> <th>values</th> </tr>
<tr><td>data-subreddit</td><td>The subreddit you want to embed</td> <td>any subreddit</td>   </tr>
<tr><td>data-domain</td><td>If you want to embed all posts coming from a domain. Do not include if you want to embed a regular subreddit</td> <td>any valid domain</td>   </tr>
<tr><td>data-width</td><td>Width of the post widget.</td> <td>number</td>  </tr>
<tr><td>data-height</td><td>Height of the post widget.</td> <td>number</td>  </tr>
<tr><td>data-sort</td><td>Sort order of subreddit</td> <td>hot, new, controversial, rising, top, gilded</td>  </tr>
<tr><td>data-theme</td><td>Change the theme</td> <td>light, dark  </tr>
<tr><td>data-timeframe</td><td>If top or controversial is select you can show posts from a specific time period.</td> <td>hour,day,week,month,year,all </tr>
<tr><td>data-subreddit-mode</td><td>How you want to display a subreddit</td> <td>normal,small,grid,large</td>  </tr>
</table>

##### example with options
<script src='//redditjs.com/subreddit.js' data-subreddit='BeavisAndButthead' data-height='500' data-width='500' data-sort='top' data-theme='light' data-timeframe='month' data-subreddit-mode='grid'></script>


#### How to run redditjs locally
 * Clone repo `git clone git@github.com:BenjaminAdams/RedditJS.git`
 * In the console type `npm install`
 * `sudo npm -g install nodemon` This starts the node server and monitors for changes in the files and updates the code running on node.
 * Run the project and watch for live changes to the code type `nodemon` and you should be able to open it in http://localhost:8002/ 
 * To minify the code for production type `grunt` which creates `styles.min.css` and `DesktopInit.min.js`
 * If are not seeing changes you make live, you may need to change /server/views/jade to have `script(src='/js/app/init/DesktopInit.min.js')` to `script(src='/js/app/init/DesktopInit.js')` also change link`(rel='stylesheet', href='/css/styles.min.css')` to `link(rel='stylesheet', href='/css/styles.css')`

#### How to setup oauth to run locally or on your own server
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
