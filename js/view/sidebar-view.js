define(['jquery', 'underscore', 'backbone', 'resthub', 'hbs!template/sidebar', 'model/sidebar',  'cookie'],
    function($, _, Backbone, Resthub, SidebarTmpl, SidebarModel,Cookie){
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
				var self = this;
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
				//url: "http://www.reddit.com/api/login",
				
				
				
			    $.ajax({
				url: "/api/index.php?url=http://www.reddit.com/api/login/",
				type:'POST',
				dataType:"json",
				data: data,
				//crossDomain: true,
				success:function (data) {
					 console.log(data);
				    
					if(data.json.errors.length > 0)	
					{
						console.log("LOGIN ERROR", data.json.errors)
					}else
					{
						 // login data
						var loginData = data.json.data;
						console.log(loginData)
									
						console.log("setting cookie=", loginData.cookie) 
								   
						// set cookie
						$.cookie('reddit_session', loginData.cookie);
						$.cookie('modhash', loginData.modhash);
						 //self.setCookie('reddit_session', loginData.cookie, 1);
							
							
					}
				 },
				 error:function (data) {
					 console.log("ERROR inrequest details: ", data);
				   
				 }
			 });
				

				
			}


        });
        return SidebarView;
    });