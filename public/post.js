//post widget
(function() {
	"use strict";

	//var script = document.getElementById('rjs_post');

	var scripts = document.getElementsByTagName('script');
	var script = scripts[scripts.length - 1]; //the script that loaded this file

	(function redditJSInit(script) {

		var postUrl;
		var width;
		var height;
		var postSortOrder;
		var script;

		initScript(script)

		function initScript(script) {

			if (script) {

				postUrl = script.getAttribute('data-url') || window.location.href
				width = script.getAttribute('data-width') || 500
				height = script.getAttribute('data-height') || 350
				postSortOrder = script.getAttribute('postSortOrder') || 'mostComments'

				var embedUrl = "http://localhost:8002/embed?url=" + postUrl + '&width=' + width + '&height=' + height + '&postSortOrder=' + postSortOrder

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
		}

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

				ifrm.style.border = '5px #f0f0f0 solid'
				ifrm.style.resize = 'both';
				ifrm.style.overflow = 'auto';

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

	})(script);

}());