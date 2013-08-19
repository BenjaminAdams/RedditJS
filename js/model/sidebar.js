define(['underscore', 'backbone', 'jquery'], function(_, Backbone,$) {
  var Sidebar = Backbone.Model.extend({
		initialize: function(data) {
			this.subName = data
		},
		
		url: function() {
			if(this.subName=="front"){
				return 'http://api.reddit.com/.json?jsonp=?';		
			}
			else
			{	
				return "http://api.reddit.com/r/"+this.subName+"/about.json?jsonp=?"
			}
		},
		
		
		// Default attributes 
		defaults: {
		 // name: "Beer name",
		 // image:"some img",
		//  slug: "slug"
		},
		//so we have the attributes in the root of the model
		parse: function (response) {
			data= response.data
			var timeAgo = moment.unix(data.created).fromNow(true)  //"true" removes the "ago"
			timeAgo = timeAgo.replace("in ",''); //why would it add the word "in"
			data.timeAgo = timeAgo
			data.timeUgly = moment.unix(data.created).format()
			data.timePretty = moment.unix(data.created).format("ddd MMM DD HH:mm:ss YYYY") + " UTC"  //format Sun Aug 18 12:51:06 2013 UTC
			
			//data.description = markdown.toHTML(data.description)
			data.description_html = (typeof data.description_html === 'undefined') ? '' : $('<div/>').html(data.description_html).text();
			//data.description_html = data.description_html.replace("reddit.com","redditjs.com")
			return data;

		}
	
	
	

  });
  return Sidebar;
});
