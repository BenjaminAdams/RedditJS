/* Prefs-view.js View

Change site settings

*/
define(['App', 'underscore', 'backbone', 'hbs!template/prefs', 'view/basem-view'],
	function(App, _, Backbone, PrefsTmpl, BaseView) {
		return BaseView.extend({
			template: PrefsTmpl,
			events: {
				//'submit #newlink': "submitForm",
				'change input': 'updateSettings',
				"change select": "updateSettings",
				'click .apply-preferences': "applyPreferences"
			},

			initialize: function(options) {
				_.bindAll(this);
				this.model = App.settings
			},
			onRender: function() {
				this.showSettings()
			},
			//was having trouble getting handlebars template setting the settings values
			//doing it in this function instead
			showSettings: function() {
				var self = this

				for (var item in App.settings.attributes) {
					var input = self.$('#' + item)
					var type = input.prop('type')
					if (type == 'checkbox') {
						input.prop('checked', self.stringToBoolean(App.settings.attributes[item]));
					} else if (type == 'select-one') {
						input.val(App.settings.attributes[item]);
						//$('#' + item + ' option[value=' + App.settings.attributes[item] + ']').attr('selected', 'selected');

					} else if (type == 'text') {
						input.val(App.settings.attributes[item]);
					}
				}

				//set radios manually
				setTimeout(function() {
					//not sure why this needs a settimeout, but it does :(
					$('input:radio[name="cssType"][value="' + App.settings.attributes.cssType + '"]').attr('checked', true);
				}, 111)

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
				App.settings.set(o);
				for (var item in o) {
					//console.log('name =' + item, 'value=' + o[item])
					$.cookie(item, o[item], {
						path: '/',
						expires: 364
					});

				}

				//return o;
			},
			applyPreferences: function() {
				location.reload();
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
	});