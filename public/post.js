//post widget

// var scripts = document.getElementsByTagName('script');
// console.table(scripts)
// for (var i = 0, l = scripts.length; i < l; i++) {
// 	if (scripts[i].src.indexOf('redditjs.com/post.js') > -1) {
// 		alert(scripts[i].getAttribute('data-id'));
// 		break;
// 	}
// }

var script = document.getElementById('rjs_post');
//alert(script.getAttribute('data-id'));

if (script) {
	writeInlineCss()
	var postUrl = script.getAttribute('data-url') || window.location.href
	var width = script.getAttribute('data-width') || 500
	var height = script.getAttribute('data-height') || 350
	var postSortOrder = script.getAttribute('postSortOrder') || 'mostComments'

	//<div class='redditjs_iframe_wrapper'><iframe id='redditjs_post' src='$embedURL' ></iframe></div>

	////$embedURL = "http://localhost:8002/embed?url=$currentURL&submitPostImg=$submitPostImg&postSortOrder=$postSortOrder";

	var embedUrl = "http://localhost:8002/embed?url=" + postUrl + '&width=' + width + '&height=' + height + '&postSortOrder=' + postSortOrder

	var iframeWrapper = document.createElement("div");
	iframeWrapper.setAttribute('id', 'redditjs_iframe_wrapper');
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

function setupMessenger(ifrm) {
	var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
	var eventer = window[eventMethod];
	var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

	//cache jquery objects
	//var $redditjs_post = $('#redditjs_post')

	// Listen to message from child window
	eventer(messageEvent, function(e) {

		if (typeof e === 'undefined' && typeof e.data === 'undefined') {
			//error checking
			return;
		}

		ifrm.style.border = '5px #f0f0f0 solid'
		ifrm.style.resize = 'both';
		ifrm.style.overflow = 'auto';

		if (typeof e.data.newWidth !== 'undefined' || typeof e.data.newHeight !== 'undefined') {
			//add class
			if (ifrm.classList) {
				ifrm.classList.add('iframePostLoaded');
			} else {
				ifrm.className += ' ' + 'iframePostLoaded';
			}

			var newHeight = e.data.newHeight || height
			var newWidth = e.data.newWidth || width

			setHeight(ifrm, newHeight)
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

function writeInlineCss() {
	document.write("<style> .redditjs_iframe_wrapper{width:100%}#redditjs_post{display:block;margin:0 auto;border:5px #f0f0f0 solid;width:0;height:0}.iframePostLoaded{resize:both;overflow:auto}</style>")
}