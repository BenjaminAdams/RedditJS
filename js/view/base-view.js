define([
  'underscore', 'backbone', 'resthub', 'cookie'],
	function(_, Backbone, Resthub, Cookie) {
		var BaseView = Resthub.View.extend({
			api: function(url, type, params, callback) {
				if (this.checkIfLoggedIn() == true || params.byPassAuth == true) {
					var cookie = $.cookie('reddit_session');

					$.ajax({
						url: "/api/index.php?url=" + url + "&cookie=" + cookie,
						type: type,
						dataType: "json",
						data: params,
						success: function(data) {
							callback(data)
						},
						error: function(data) {
							console.log("ERROR inrequest details: ", data);
							callback(data)

						}
					});
				} else {
					console.log("params in not logged in", params)
					alert("Please login to do that")
				}
			},
			checkIfLoggedIn: function() {
				var username = $.cookie('username')
				if (typeof username == "string" && username.length > 2) {
					return true;
				} else {
					return false;
				}
			},
			//Can be used to vote on a post or a comment
			vote: function(dir, id) {

				var params = {
					id: id,
					dir: dir,
					uh: $.cookie('modhash'),
				};

				this.api("api/vote", 'POST', params, function(data) {
					console.log("vote done", data)
				});
			}

		});
		return BaseView;
	});