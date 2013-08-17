jquery.videoBG 
==============

by Syd Lawrence ( www.sydlawrence.com )

Version: 0.2.1

Usage
-----

    var videoBG = $('body').videoBG(options);


FAQs
----

If not displaying correctly in Firefox, make sure your server is outputting the current MIME type for ogv and webm
videoBG is now a <video> element

Warning
-------

Don't abuse this code... Don't use it too often, too many video instances will slow down the browser.

Please bear in mind bandwidth usage for both you, and your visitors


Browser Support
---------------

<table>
<tr><td>Firefox 4+ (the best experience)</td><td>Yes (webm)</td><td>Yes</td></tr>
<tr><td>Internet Explorer 9+</td><td>Yes (mp4)</td><td>Yes</td></tr>
<tr><td>Firefox 3.5</td><td>Yes (ogv)</td><td>Yes</td></tr>
<tr><td>Chrome</td><td>Yes (webm/mp4)</td><td>Yes</td></tr>
<tr><td>Safari</td><td>Yes (mp4)</td><td>Yes</td></tr>
<tr><td>Opera 10.5+</td><td>Yes (ogv)</td><td>Yes</td></tr>
<tr><td>Internet Explorer 8</td><td>No</td><td>Yes</td></tr>
<tr><td>Internet Explorer 7</td><td>No</td><td>Yes</td></tr>
<tr><td>Android Browser</td><td>No</td><td>Yes</td></tr>
<tr><td>Mobile Safari</td><td colspan=2>Does not modify default behaviour</tr>
<tr><td>Older Browsers that support position:fixed</td><td>No</td><td>Yes</tr>
<tr><td>Archaic browsers</td><td colspan=2>Does not modify default behaviour</tr> 
</table>
