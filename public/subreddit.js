//subreddit widget
(function() {
	"use strict";

	var scripts = document.getElementsByTagName('script');
	var theScriptThatCalledThis = scripts[scripts.length - 1]; //the script that loaded this file

	(function redditJSsubredditInit(script) {

		var width;
		var height;
		var script;
		var cssTheme;
		var timeFrame;
		var sort;
		var subreddit;
		var grid;
		var domain;

		(function init() {

			if (script) {
				var base;
				width = script.getAttribute('data-width') || 400
				height = script.getAttribute('data-height') || 400
				cssTheme = script.getAttribute('data-theme') || 'light'
				sort = script.getAttribute('data-sort') || 'hot'
				subreddit = script.getAttribute('data-subreddit') || 'front'
				timeFrame = script.getAttribute('data-timeframe') || 'month'
				grid = script.getAttribute('data-subreddit-mode') || 'normal'
				domain = script.getAttribute('data-domain') || null

				//  /r/funny/top/day
				if (domain !== null) {
					base = "domain/" + domain
				} else {
					base = "r/" + subreddit
				}

				var embedUrl = 'https://redditjs.com/' + base + '/' + sort + '/' + timeFrame + '?cssTheme=' + cssTheme + '#' + grid

				var iframeWrapper = document.createElement("div");
				iframeWrapper.style.width = '100%'

				var ifrm = document.createElement("IFRAME");
				ifrm.setAttribute("src", embedUrl);
				//start out invis and expand after loaded
				ifrm.style.height = height + 'px'
				ifrm.style.width = width + 'px'
				ifrm.style.margin = '0 auto'
				ifrm.style.display = 'block'
				ifrm.style.top = 0
				ifrm.style.left = 0

				addIframeCss(ifrm)

				iframeWrapper.appendChild(ifrm)
				script.parentNode.insertBefore(iframeWrapper, script.nextSibling);

				setupMessenger(ifrm)

			}
		})()

		function setupMessenger(ifrm) {
			var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
			var eventer = window[eventMethod];
			var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

			// Listen to message from child window
			eventer(messageEvent, function(e) {

				if (typeof e === 'undefined' && typeof e.data === 'undefined') {
					//error checking
					return;
				}
				if (e.data.maximize === true) {
					return maximizeWidget(ifrm)
				}

			}, false);
		}

		function maximizeWidget(ifrm) {
			ifrm.style.width = "84%"
			ifrm.style.height = "90%"
			ifrm.style.margin = "2% 8% 0%"
			ifrm.style.zIndex = '3'
			ifrm.style.position = 'fixed'

			//add a close button, give it a click event to minimize
			var overlay = document.createElement("div");
			overlay.style.width = '100%'
			overlay.style.height = '100%'
			overlay.style.background = 'rgba(0,0,0,0.7)'
			overlay.style.position = 'fixed'
			overlay.style.top = '0px'
			overlay.style.left = '0px'
			overlay.style.zIndex = '0'
			overlay.onclick = function() {
				this.parentNode.removeChild(this);
				minimizeWidget(ifrm)
			};
			ifrm.parentNode.insertBefore(overlay, ifrm.nextSibling)
			//add dark gray overlay, z-index under the popup
		}

		function minimizeWidget(ifrm) {
			ifrm.style.width = width + 'px'
			ifrm.style.height = height + 'px'
			ifrm.style.margin = "0 auto"
			ifrm.style.position = 'relative'
		}

		function hideIframe(ifrm) {
			setHeight(ifrm, newHeight)
			setWidth(ifrm, newWidth)
			ifrm.style.border = '0px #f0f0f0 solid'
			ifrm.style.resize = 'none';
			ifrm.style.overflow = 'inherit';
		}

		function addIframeCss(ifrm) {

			var borderColor = '';
			if (cssTheme === 'dark') {
				borderColor = '#460000'
			} else {
				borderColor = '#5f99cf'
			}
			ifrm.style.border = '2px ' + borderColor + ' solid'
			ifrm.style.overflow = 'auto';
		}

		function setHeight(ifrm, newHeight) {
			//ifrm.height = newHeight
			//ifrm.css('height', newHeight)
			ifrm.style.height = newHeight + "px"

		}

		function setWidth(ifrm, newWidth) {
			//ifrm.width = newWidth
			//ifrm.css('width', newWidth)
			ifrm.style.width = newWidth + "px"
		}

	})(theScriptThatCalledThis);

}());