/* Prefs-view.js View

Change site settings

*/
define(['underscore', 'backbone', 'resthub', 'hbs!template/prefs', 'view/base-view', 'event/channel'],
	function(_, Backbone, Resthub, PrefsTmpl, BaseView, channel) {
		var PrefsView = BaseView.extend({
			//strategy: 'append',
			el: $(".content"),
			template: PrefsTmpl,
			events: {
				//'submit #newlink': "submitForm",
				'change input': 'updateSettings',
				"change select": "updateSettings"
			},

			initialize: function(options) {
				_.bindAll(this);
				this.$el.empty()

				this.model = window.settings

				this.render();
				this.showSettings()

			},
			//was having trouble getting handlebars template setting the settings values
			//doing it in this function instead
			showSettings: function() {
				var self = this

				for (var item in window.settings.attributes) {
					//console.log('name =' + item, 'value=' + window.settings.attributes[item])
					var input = self.$('#' + item)
					var type = input.prop('type')
					//console.log(input.prop('type'))
					if (type == 'checkbox') {
						//console.log(window.settings.attributes[item])
						input.prop('checked', self.stringToBoolean(window.settings.attributes[item]));
					} else if (type == 'select-one') {
						$('#' + item).val(window.settings.attributes[item]);

					}
				}
			},
			updateSettings: function() {
				var $inputs = this.$el.find('input, select,textarea,radio');
				var o = {};
				_.each($inputs, function(input) {
					var $input = $(input);
					var name = $input.attr('name');
					var value = $input.val() || '';
					var type = $input.attr('type');

					switch (type) {
						case 'checkbox':
							if ($input.is(':checked')) {
								o[name] = true;
							} else {
								o[name] = false;
							}
							break;
						case 'radio':
							o[name] = $input.parent().parent().find("input[name='" + name + "']:checked").val()
							break;
						default:
							o[name] = value;
							break;
					}

				});
				window.settings.set(o);
				//console.log(window.settings)
				for (var item in o) {
					//console.log('name =' + item, 'value=' + o[item])
					$.cookie(item, o[item], {
						path: '/'
					});
				}

				//return o;
			},
			stringToBoolean: function(string) {

				if (typeof string === 'undefined') {
					return false
				} else if (typeof string === 'boolean') {
					return string
				} else if (typeof string === 'string') {

					switch (string.toLowerCase()) {
						case "true":
						case "yes":
						case "1":
							return true;
						case "false":
						case "no":
						case "0":
						case null:
							return false;
						default:
							return Boolean(string);
					}
				}
			}

		});
		return PrefsView;
	});