define([
  'underscore', 'backbone', 'resthub', 'cookie'],
	function(_, Backbone, Resthub, Cookie) {
		var BaseView = Resthub.View.extend({
			api: function(url, type, params, callback) {
				if (checkIfLoggedIn() == true) {
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
			}

		});
		return BaseView;
	});