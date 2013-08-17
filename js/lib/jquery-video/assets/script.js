
$(document).ready(function() {


	$('body').videoBG({
		position:"fixed",
		zIndex:0,
		mp4:'assets/christmas_snow.mp4',
		ogv:'assets/christmas_snow.ogv',
		webm:'assets/christmas_snow.webm',
		poster:'assets/christmas_snow.jpg',
		opacity:1,
		fullscreen:true,
	});
	
	
	$('#div_demo').videoBG({
		mp4:'assets/tunnel_animation.mp4',
		ogv:'assets/tunnel_animation.ogv',
		webm:'assets/tunnel_animation.webm',
		poster:'assets/tunnel_animation.jpg',
		scale:true,
		zIndex:0
	});
	
	
	$('#text_replacement_demo').videoBG({
		mp4:'assets/text_replacement.mp4',
		ogv:'assets/text_replacement.ogv',
		webm:'assets/text_replacement.webm',
		poster:'assets/text_replacement.png',
		textReplacement:true,
		width:760,
		height:24
	});
		
})