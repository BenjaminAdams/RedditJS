/*
	This file generates a json file containg all of the subreddit image headers
	To run type:  node genImgHeaders.js
*/

var jsonGenerator = require('./imgHeaderFunctions')
jsonGenerator.checkTimeStampToRefreshImgs()