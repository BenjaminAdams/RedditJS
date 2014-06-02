//subreddit widget
(function() {
	"use strict";

	var scripts = document.getElementsByTagName('script');
	var theScriptThatCalledThis = scripts[scripts.length - 1]; //the script that loaded this file

	(function redditJSInit(script) {

		var width;
		var height;
		var script;
		var cssTheme;

		(function init() {

			if (script) {

				width = script.getAttribute('data-width') || 250
				height = script.getAttribute('data-height') || 250
				cssTheme = script.getAttribute('data-theme') || 'light'
				cssTheme = script.getAttribute('sort') || 'how'
				subreddit = script.getAttribute('data-subreddit') || 'front'

				var embedUrl = "http://redditjs.com/"

				var iframeWrapper = document.createElement("div");
				iframeWrapper.style.width = '100%'

				var ifrm = document.createElement("IFRAME");
				ifrm.setAttribute("src", embedUrl);
				//start out invis and expand after loaded
				ifrm.style.height = '0px'
				ifrm.style.width = '0px'
				ifrm.style.margin = '0 auto'
				ifrm.style.display = 'block'

				iframeWrapper.appendChild(ifrm)
				//script.appendChild(iframeWrapper)
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

				if (e.data.newWidth === 0 && e.data.newHeight === 0) {
					hideIframe(ifrm)
					return
				}

				addIframeCss(ifrm)

				if (typeof e.data.newWidth != null) {
					var newHeight = e.data.newHeight || height
					setHeight(ifrm, newHeight)
				}

				if (typeof e.data.newHeight != null) {
					var newWidth = e.data.newWidth || width
					setWidth(ifrm, newWidth)
				}

			}, false);
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
			ifrm.style.resize = 'both';
			ifrm.style.overflow = 'auto';
		}

		function setHeight(ifrm, newHeight) {
			ifrm.height = newHeight
			//ifrm.css('height', newHeight)
			ifrm.style.height = newHeight + "px"

		}

		function setWidth(ifrm, newWidth) {
			ifrm.width = newWidth
			//ifrm.css('width', newWidth)
			ifrm.style.width = newWidth + "px"
		}

	})(theScriptThatCalledThis);

}());