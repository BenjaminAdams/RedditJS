//post widget
(function() {
	"use strict";

	var scripts = document.getElementsByTagName('script');
	var theScriptThatCalledThis = scripts[scripts.length - 1]; //the script that loaded this file

	(function redditJSInit(script) {

		var postUrl;
		var width;
		var height;
		var postFinder;
		var script;
		var cssTheme;
		var showSubmit;
		var borderColor;
		var embedId = Math.floor((Math.random() * 999999) + 1);
		var host = getHost(script);

		(function init() {

			if (script) {

				postUrl = script.getAttribute('data-url') || window.location.href
				//postUrl = encodeURIComponent(postUrl) //sometiems has # in the URL and messes things up
				width = script.getAttribute('data-width') || 500
				height = script.getAttribute('data-height') || 500
				postFinder = script.getAttribute('data-post-finder') || 'mostComments'
				cssTheme = script.getAttribute('data-theme') || 'light'
				showSubmit = script.getAttribute('data-show-submit') || 'true'

				if (cssTheme === 'dark') {
					borderColor = '#460000'
				} else {
					borderColor = '#5f99cf'
				}

				var embedUrl = host + '/embed?width=' + width + '&height=' + height + '&postFinder=' + postFinder + '&cssTheme=' + cssTheme + '&showSubmit=' + showSubmit + '&embedId=' + embedId + '&url=' + postUrl

				var iframeWrapper = document.createElement("div");
				iframeWrapper.style.width = '100%'

				var ifrm = document.createElement("IFRAME");
				ifrm.setAttribute("src", embedUrl);
				//start out invis and expand after loaded
				ifrm.style.height = '0px'
				ifrm.style.width = '0px'
				ifrm.style.margin = '0 auto'
				ifrm.style.display = 'block'
				ifrm.style.top = 0
				ifrm.style.left = 0

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

				if ((typeof e === 'undefined' && typeof e.data === 'undefined') || (e.origin != 'https://redditjs.com' && e.origin != 'http://localhost:8002')) {
					//error checking
					return;
				}

				if (e.data.embedId != embedId) { //it comes back as a string, cant use strict comparison
					return
				}

				if (e.data.newWidth === 0 && e.data.newHeight === 0) {
					hideIframe(ifrm)
					return
				}

				if (e.data.maximize === true) {
					return maximizeWidget(ifrm)
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

		function maximizeWidget(ifrm) {
			ifrm.style.width = "84%"
			ifrm.style.height = "90%"
			ifrm.style.zIndex = '9999999999'
			ifrm.style.position = 'fixed'
			ifrm.style.left = '8%'
			ifrm.style.top = '2%'

			//add a close button, give it a click event to minimize
			var overlay = document.createElement("div");
			overlay.style.width = '100%'
			overlay.style.height = '100%'
			overlay.style.background = 'rgba(0,0,0,0.7)'
			overlay.style.position = 'fixed'
			overlay.style.top = '0px'
			overlay.style.left = '0px'
			overlay.style.zIndex = '9999999'
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
			ifrm.style.zIndex = '1'
			ifrm.style.left = 0
			ifrm.style.top = 0
		}

		function hideIframe(ifrm) {
			ifrm.style.height = 0
			ifrm.style.width = 0
			ifrm.style.border = '0px #f0f0f0 solid'
			//ifrm.style.resize = 'none';
			ifrm.style.overflow = 'inherit';
		}

		function addIframeCss(ifrm) {

			ifrm.style.border = '2px ' + borderColor + ' solid'
			//ifrm.style.resize = 'both';
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
			//ifrm.width = 0

		}

		function getHost(script) {
			return script.src.replace('/post.js', '')
		}

	})(theScriptThatCalledThis);

}());