define(['jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/sidebar', 'model/sidebar', 'easyXDM'],
    function($, _, Backbone, Resthub, SidebarTmpl, SidebarModel,EasyXDM){
        var SidebarView = Resthub.View.extend({
			//strategy: 'append',
            events: {
                'click .theLoginBtn':  'login',
              //  'keyup #new-todo':     'showTooltip'
            },
            
            initialize: function(data) {
			    _.bindAll(this);
				this.template = SidebarTmpl;
                this.model = new SidebarModel(data.subName)
               // this.render();
			   this.model.fetch({success : this.loaded});
                // this.$() is a shortcut for this.$el.find().
            },
			loaded: function(response, sidebar){
				this.render()
			},
			login: function(e) {
				e.preventDefault()
				var user = this.$(".loginUsername").val()
				var pw = this.$(".loginPassword").val()
				console.log(user,pw)
				
				var data = {
					api_type: "json",
					rem: "true",
					user: user,
					passwd: pw
				};
				
				//http://www.reddit.com/api/login/?user=faketestuser&passwd=abc123&api_type=json
				//https://ssl.reddit.com/api/login/?user=faketestuser&passwd=abc123&api_type=json
				
			    $.ajax({
				url: "http://www.reddit.com/api/login",
				type:'POST',
				dataType:"jsonp",
				data: data,
				crossDomain: true,
				success:function (data) {
					 console.log(["Login request details: ", data]);
				   
					 if(data.error) {  // If there is an error, show the error messages
						////$('.alert-error').text(data.error.text).show();
						 console.log("ERROR", data.error)
					 }
					 else { // If not, send them back to the home page
						////window.location.replace('#');
					 }
				 }
			 });
				

				
			}


        });
        return SidebarView;
    });