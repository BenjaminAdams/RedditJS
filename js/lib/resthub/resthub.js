define(['underscore', 'backbone', 'jquery', 'lib/resthub/jquery-event-destroyed'], function(_, Backbone, $) {

    var Resthub = { };

    Resthub.VERSION = '2.1.2';

    // Avoid GET caching issues with Internet Explorer
    if (XMLHttpRequest) {
        $.ajaxSetup({ cache: false });
    }

    Resthub.Validation = (function() {

        var ResthubValidation = {};

        // store the list of already synchronizedClasses models class names
        var synchronizedClasses = {};

        // locale initialization
        var locale = window.navigator.language || window.navigator.userLanguage;

        // is locale changed ?
        var localeChanged = false;

        ResthubValidation.options = {
            // server url for the web service exporting validation constraints
            apiUrl: 'api/validation'
        };

        ResthubValidation.messages = {};

        // Function to be called by end user once the locale changed on client.
        // set the current locale and a flag
        ResthubValidation.locale = function(loc) {
            if (loc != locale) localeChanged = true;
            locale = loc;
        };

        // Constructs the array of validation constraints in Backbone Validation format
        // from the response sent by the server for the current model.
        // This method consider an optional messages object containing the custom or localized
        // messages, if any.
        var buildValidation = function(resp, model, messages) {

            // copy existing validation object, if any
            var validation = _.clone(model.prototype.validation) || {};

            for (var propKey in resp.constraints) {

                // ignore property if already defined in client model
                if (validation[propKey]) continue;

                // manage eventual inclusions and exclusions
                if (model.prototype.excludes && _.indexOf(model.prototype.excludes, propKey) != -1) {
                    continue;
                } else if (model.prototype.includes && _.indexOf(model.prototype.includes, propKey) == -1) {
                    continue;
                }

                var prop = [];
                var constraints = resp.constraints[propKey];
                var constraint;
                var required = null;

                for (var idx in constraints) {
                    constraint = null;
                    var currentConstraint = constraints[idx];
                    // replace returned message by the client custom provided message, if any
                    var msg = constraintMessage(propKey, currentConstraint, messages);

                    // get the validator for the current constraint type
                    // and execute callback if defined.
                    // provides a concrete Backbone Validation constraint
                    var validator = validators[currentConstraint.type];
                    if (validator) {
                        constraint = validator(currentConstraint, msg);
                    }

                    if (constraint) {
                        // is the current constraint contains a requirement to true ?
                        if (constraint.required) required = constraint.required;
                        prop.push(constraint);
                    }
                }

                if (constraint) {
                    // Manage requirements because, by default, any expressed constraint in
                    // Backbone Validation implies a requirement to true.
                    // To manage a constraint with a requirement to false, we add a required false
                    // constraint to the current property if no true requirement was originally expressed
                    if (!required) {
                        prop.push({required: false});
                    }

                    validation[propKey] = prop;
                }
            }

            // Set the built validation constraint to the current model but also save the original client
            // validation to be able to rebuild this later (e.g. when the locale changed)
            model.prototype.originalValidation = model.prototype.originalValidation || model.prototype.validation;
            model.prototype.validation = validation;
        };

        // map a constraint type to a concrete validator function
        var validators = {
            'NotNull': function(constraint, msg) {
                return {
                    required: true,
                    msg: msg
                };
            },
            'NotEmpty': function(constraint, msg) {
                return {
                    required: true,
                    fn: function(value) {
                        return notBlankOrEmptyValidator(value, msg);
                    }
                };
            },
            'NotBlank': function(constraint, msg) {
                return {
                    required: true,
                    fn: function(value) {
                        return notBlankOrEmptyValidator(value, msg);
                    }
                };
            },
            'Null': function(constraint, msg) {
                return {
                    fn: function(value) {
                        return nullValidator(value, msg);
                    }
                };
            },
            'AssertTrue': function(constraint, msg) {
                return {
                    fn: function(value) {
                        return assertTrueValidator(value, msg);
                    }
                };
            },
            'AssertFalse': function(constraint, msg) {
                return {
                    fn: function(value) {
                        return assertFalseValidator(value, msg);
                    }
                };
            },
            'Size': function(constraint, msg) {
                return {
                    fn: function(value) {
                        return sizeValidator(value, constraint.min, constraint.max, msg);
                    }
                };
            },
            'Min': function(constraint, msg) {
                return {
                    fn: function(value) {
                        return minValidator(value, constraint.value, msg);
                    }
                };
            },
            'DecimalMin': function(constraint, msg) {
                return {
                    fn: function(value) {
                        return decimalMinValidator(value, constraint.value, msg);
                    }
                };
            },
            'Max': function(constraint, msg) {
                return {
                    fn: function(value) {
                        return maxValidator(value, constraint.value, msg);
                    }
                };
            },
            'DecimalMax': function(constraint, msg) {
                return {
                    fn: function(value) {
                        return decimalMaxValidator(value, constraint.value, msg);
                    }
                };
            },
            'Pattern': function(constraint, msg) {
                return {
                    pattern: constraint.regexp,
                    msg: msg
                };
            },
            'URL': function(constraint, msg) {
                return {
                    fn: function(value) {
                        return urlValidator(value, constraint.protocol, constraint.host, constraint.port, constraint.regexp, msg);
                    }
                };
            },
            'Range': function(constraint, msg) {
                return {
                    range: [constraint.min || 0, constraint.max || 0x7fffffffffffffff],
                    msg: msg
                };
            },
            'Length': function(constraint, msg) {
                return {
                    rangeLength: [constraint.min || 0, constraint.max || 0x7fffffff],
                    msg: msg
                };
            },
            'Email': function(constraint, msg) {
                return {
                    pattern: 'email',
                    msg: msg
                };
            },
            'CreditCardNumber': function(constraint, msg) {
                return {
                    fn: function(value) {
                        return creditCardNumberValidator(value, msg);
                    }
                };
            }
        };

        ResthubValidation.options.URL = {
            // regular expression used to validate urls
            urlPattern: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/,

            // regular expression used to parse urls
            urlParser: /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/
        };

        // add or replace the validator associated to the given constraintType.
        // validator parameter should be a function
        ResthubValidation.addValidator = function(constraintType, validator) {
            validators[constraintType] = validator;
        };

        // retrieve the validator associated to a given constraint type
        ResthubValidation.getValidator = function(constraintType) {
            return validators[constraintType];
        };

        // implementation of Luhn algorithm
        var creditCardNumberValidator = function(value, msg) {
            if (value == null || isNaN(value - 0) || !(_.isString(value) || _.isNumber(value))) return msg;

            var sum = _.reduce(_.map(value.split('').reverse(), Number), function(s, d, i) {
                return s + (i % 2 == 1 ? (d == 9 ? 9 : (d * 2) % 9) : d);
            }, 0);

            if (sum % 10 != 0) return msg;
        };

        // retrieves a message key in the client side defined messages map if any
        // returns the value contained in messages map if any (e.g. for localization
        // purposes) or the original message if no data found in messages object
        var constraintMessage = function(propKey, constraint, messages) {
            var msg = constraint.message;

            var msgPropKey = 'validation.' + propKey + '.' +  constraint.type + '.message';
            var msgKey = 'validation.' + constraint.type + '.message';

            if (messages) {

                if (messages[msgPropKey]) {
                    msg = messages[msgPropKey];
                } else if (messages[msgKey]) {
                    msg = messages[msgKey];
                }

                for (var p in constraint) {
                    msg = msg.replace(new RegExp('{' + p + '}', 'g'), constraint[p]);
                }
            }

            return msg;
        };

        var nullValidator = function(value, msg) {
            if (ResthubValidation._hasValue(value)) {
                return msg;
            }
        };

        var notBlankOrEmptyValidator = function(value, msg) {
            if (!ResthubValidation._hasValue(value)) {
                return msg;
            }
        };

        var assertTrueValidator = function(value, msg) {
            if (ResthubValidation._hasValue(value) && ((_.isString(value) && value.toLowerCase() != "true") || !value)) {
                return msg;
            }
        };

        var assertFalseValidator = function(value, msg) {
            if (ResthubValidation._hasValue(value) && ((_.isString(value) && value.toLowerCase() == "true") || (_.isBoolean(value) && value))) {
                return msg;
            }
        };

        var minValidator = function(value, min, msg) {
            var numValue = parseInt(value);
            if (ResthubValidation._hasValue(value) && (isNaN(numValue) || (numValue != value) || (numValue < min))) {
                return msg;
            }
        };

        var maxValidator = function(value, max, msg) {
            var numValue = parseInt(value);
            if (ResthubValidation._hasValue(value) && (isNaN(numValue) || (numValue != value) || (numValue > max))) {
                return msg;
            }
        };

        var decimalMinValidator = function(value, min, msg) {
            var numValue = parseFloat(value);
            if (ResthubValidation._hasValue(value) && (isNaN(numValue) || (numValue != value) || (numValue < min))) {
                return msg;
            }
        };

        var decimalMaxValidator = function(value, max, msg) {
            var numValue = parseFloat(value);
            if (ResthubValidation._hasValue(value) && (isNaN(numValue) || (numValue != value) || (numValue > max))) {
                return msg;
            }
        };

        var sizeValidator = function(value, min, max, msg) {
            if (!(_.isNull(value) || _.isUndefined(value) || (_.isString(value) && value === ''))
                && (!(_.isString(value) || _.isArray(value)) || (value.length < min || value.length > max))) {
                return msg;
            }
        };

        var urlValidator = function(value, protocol, host, port, regexp, msg) {
            if (!_.isString(value) || !value.match(ResthubValidation.options.URL.urlPattern)) {
                return msg;
            }
            if (regexp && !value.match(regexp)) {
                return msg;
            }

            var urlParts = value.match(ResthubValidation.options.URL.urlParser);
            var protocolValue = urlParts[2];

            if (protocol && protocol != protocolValue) {
                return msg;
            }

            if (host || port != -1) {
                var hostValue = urlParts[4];
                if (!hostValue) return msg;
                var indexOfPort = hostValue.indexOf(':');
                if (indexOfPort > -1) {
                    var portValue = hostValue.substring(indexOfPort + 1);
                    hostValue = hostValue.substring(0, indexOfPort);
                }

                // test if a port is defined and if is a valid number
                if (port != -1 && (isNaN(portValue - 0) || (port != portValue))) {
                    return msg;
                }

                if (host && host != hostValue) {
                    return msg;
                }
            }
        };

        // force synchronization to be relaunched on the next model instantiation
        // holding a className attribute equals to this className parameter
        ResthubValidation.forceSynchroForClass = function(className) {
            if (synchronizedClasses[className]) synchronizedClasses[className] = false;
        };

        // returns true if the value parameter is defined, not null and not empty (in case of a String or an Array)
        ResthubValidation._hasValue = function(value) {
            return !(_.isNull(value) || _.isUndefined(value) || (_.isString(value) && value === '') || _.isArray(value) && value.length == 0);
        };

        // removes trailing spaces and tabs on a String.
        // use native String trim function if defined.
        ResthubValidation._trim = String.prototype.trim ?
            function(text) {
                return text === null ? '' : String.prototype.trim.call(text);
            } :
            function(text) {
                var trimLeft = /^\s+/,
                    trimRight = /\s+$/;

                return text === null ? '' : text.toString().replace(trimLeft, '').replace(trimRight, '');
            };

        // retrieves validation constraints from server
        ResthubValidation.synchronize = function(model, errorCallback, successCallback) {

            // perform effective synchronization by sending a REST GET request
            // only if the current model was not already synchronized or if the client
            // locale changed
            if (localeChanged) {
                localeChanged = false;
                synchronizedClasses = {};
            }
            if (!synchronizedClasses[model.prototype.className]) {
                // if any, re-populate validation constraints with original client side
                // expressed constraints (used in case of re-build when the first client
                // side validation array was already overrided)
                if (model.prototype.originalValidation) {
                    model.prototype.validation = model.prototype.originalValidation;
                }

                var msgs = {};
                synchronizedClasses[model.prototype.className] = true;
                $.getJSON(ResthubValidation.options.apiUrl + '/' + model.prototype.className, {locale: locale})
                    .success(_.bind(function(resp) {
                        buildValidation(resp, model, _.extend(msgs, ResthubValidation.messages, model.prototype.messages));
                        if (successCallback && _.isFunction(successCallback)) successCallback();
                    }, this))
                    .error(function (resp) {
                        synchronizedClasses[model.prototype.className] = false;
                        if (errorCallback && _.isFunction(errorCallback)) errorCallback(resp);
                        else ResthubValidation.options.errorCallback(resp);
                    });
            }
        };

        ResthubValidation.options.errorCallback = function (resp) {
            console.error("error calling server : status code " + resp.status + " and text '" + resp.statusText + "'");
        };

        return ResthubValidation;

    })();

    // extend **Backbone.View** properties and methods.
    Resthub.View = Backbone.View.extend({

        resthubViewOptions: ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'root', 'strategy', 'context'],

        globalEventsIdentifier: '!',

        strategy: 'replace',

        _ensureRoot: function() {
            this.$root = this.root instanceof $ ? this.root : $(this.root);
            if (this.$root.length != 1) {
                throw new Error('Root element "' + this.$root.selector + '" does not exist or is not unique.');
            }
            this.root = this.$root.first();
        },

        _insertRoot: function() {
            var strategy = this.strategy;
            if (strategy == 'replace') {
                strategy = 'html';
            }
            if (_.indexOf(['html', 'append', 'prepend'], strategy) === -1) {
                throw new Error('Invalid strategy "' + strategy + '", must be one of replace, append or prepend.');
            }
            this.$root[strategy](this.el);
        },

        render: function(context) {
            if (!this.template || typeof this.template !== 'function') {
                throw new Error('Invalid template provided.');
            }
            context = this._ensureContext(context);
            this.$el.html(this.template(context));
            return this;
        },

        _ensureContext: function(context) {
            // If context provided as parameter is undefined or not an object, use this.context attribute
            if ((typeof context === "undefined") || (typeof context !== 'object')) {
                context = {};
            }

            // Context provided as a context object
            if (typeof this.context === 'object') {
                _.extend(context, this.context);
            // Dynamic context provided as a function
            } else if (_.isFunction(this.context)) {
                // Merge the result of this.context() into context
                _.extend(context, this.context());
            }
            // If context provided as parameter is a Model or Collection instance, we save it for later use
            if (context instanceof Backbone.Model) {
                var jsonModel = context.toJSON();
            }
            if (context instanceof Backbone.Collection) {
                var jsonCollection = context.toJSON();
            }
            // Add in the context the property named by this.context String, this.model, this.collection and this.labels if they exist.
            _.each([this.context, 'model', 'collection', 'labels'], function(key) {
                if (typeof this[key] !== "undefined")
                    if (this[key].toJSON) {
                        // Create or merge
                        if (typeof context[key] === "undefined") {
                            context[key] = this[key].toJSON();
                        } else {
                            _.extend(context[key], this[key].toJSON());
                        }
                    } else {
                        // Create or merge
                        if (typeof context[key] === "undefined") {
                            context[key] = this[key];
                        } else {
                            _.extend(context[key], this[key]);
                        }
                        
                    }

            }, this);
            // Eventually merge default model and collection attribute with the one passed as parameter
            if (context instanceof Backbone.Model) {
                // Create or merge
                if (typeof context['model'] === "undefined") {
                    context['model'] = jsonModel;
                } else {
                    _.extend(context['model'], jsonModel);
                }
                
            }

            if (context instanceof Backbone.Collection) {
                  // Create or merge
                  if (typeof context['collection'] === "undefined") {
                    context['collection'] = jsonCollection;
                } else {
                    _.extend(context['collection'], jsonCollection);
                }

            }
            // Maybe throw an error if the context could not be determined
            // instead of returning {}
            return context;
        },

        _configure: function(options) {
            if (this.options) options = _.extend({}, this.options, options);
            for (var i = 0, l = this.resthubViewOptions.length; i < l; i++) {
                var attr = this.resthubViewOptions[i];
                if (options[attr]) this[attr] = options[attr];
            }
            this.options = options;
        },

        // Override Backbone delegateEvents() method
        // to add support of global events declarations :
        //
        // *{"!event": "callback"}*
        //
        //     {
        //       // regular backbone events
        //       'mousedown .title':  'edit',
        //       'click .button':     'save',
        //       // global events support
        //       '!viewCreated': 'onCreate',
        //       '!viewChanged': 'onChange',
        //       '!viewDeleted': function(e) { ... }
        //     }
        //
        delegateEvents: function(events) {

            Resthub.View.__super__.delegateEvents.apply(this, arguments);
            if (!(events || (events = getValue(this, 'events')))) return;
            
            _.each(events, _.bind(function(method, key) {
                if (key.indexOf(this.globalEventsIdentifier) != 0) return;
                if (!_.isFunction(method)) method = this[method];
                if (!method) throw new Error('Method "' + key + '" does not exist');
                this.listenTo(Backbone, key, method);
            }, this));

            return this;
        },

        // Override backbone setElement to bind a destroyed special event
        // when el is detached from DOM
        setElement: function(element, delegate) {
            Resthub.View.__super__.setElement.apply(this, arguments);

            if (this.root) {
                this._ensureRoot();
                this._insertRoot();
            }

            // call backbone stopListening method on el DOM removing
            this.$el.on("destroyed", _.bind(this._destroy, this));

            return this;
        },

        _destroy: function() {
            // Trigger destroy event on the view
            this.trigger("destroy");
            this.stopListening();
        },

        // Override Backbone method unbind destroyed special event
        // after remove : this prevents stopListening to be called twice
        remove: function() {
            this.$el.off("destroyed");
            // Trigger destroy event on the view
            this.trigger("destroy");
            // Unbind Backbone Validation is needed
            if (Backbone.Validation) {
                Backbone.Validation.unbind(this);
            }
            Resthub.View.__super__.remove.apply(this, arguments);

            return this;
        },

        // populate model from a form input
        //
        // form parameter could be a css selector or a jQuery element. if undefined,
        // the first form of this view el is used.
        // if no model instance is provided, search for 'this.model'
        populateModel: function(form, model) {
            var attributes = {};

            form = form || (this.el.tagName === 'FORM' ? this.$el : this.$el.find("form"));
            form = form instanceof Backbone.$ ? form : this.$el.find(form);
            var fields = form.find("input[type!='submit'][type!='button'], textarea, select");

            if (arguments.length < 2) model = this.model;

            // build array of form attributes to refresh model
            fields.each(function() {
                var $this = Backbone.$(this);
                var name = $this.attr('name');

                // specific test for radio to get only checked option or null is no option checked
                if ($this.is(':radio')) {
                    if ($this.is(':checked')) {
                        attributes[name] = $this.val();
                    } else if (!attributes[name]) {
                        attributes[name] = null;
                    }
                } else if ($this.is(':checkbox')) {
                    if (!attributes[name]) {
                        attributes[name] = null;
                        var checkboxes = form.find("input[type='checkbox'][name='" + name + "']");
                        if (checkboxes.length > 1) {
                            attributes[name] = [];
                        }
                        else if (checkboxes.length === 1) {
                            attributes[name] = "false";
                        }
                    }
                    if ($this.is(':checked')) {
                        if (_.isArray(attributes[name])) {
                            attributes[name].push($this.val());
                        } else {
                            attributes[name] = $this.val();
                        }
                    }
                } else {
                    attributes[name] = $this.val();
                }
            });

            if (model) {
                model.set(attributes, {validate: true});
            }

            return this;
        }

    });


    // Backbone.History extension
    // --------------------------

    var originalHistPrototype = Backbone.History.prototype;
    var originalStart = originalHistPrototype.start;

    // extend **Backbone.History** properties and methods.
    _.extend(Backbone.History.prototype, {
        // Override backbone History start to bind intercept a clicks in case of pushstate activated
        // and execute a Backbone.navigate instead of defaults
        start: function(options) {
            var ret = originalStart.call(this, options);

            if (options && options.pushState) {
                // force all links to be handled by Backbone pushstate - no get will be send to server
                $(window.document).on('click', 'a[href]:not([data-bypass])', function(evt) {

                    var protocol = this.protocol + '//';
                    var href = this.href;
                    href = href.slice(protocol.length);
                    href = href.slice(href.indexOf("/") + 1);

                    if (href.slice(protocol.length) !== protocol) {
                        evt.preventDefault();
                        Backbone.history.navigate(href, true);
                    }
                });
            }

            return ret;
        }
    });

    // Helper function to get a value from a Backbone object as a property
    // or as a function.
    var getValue = function(object, prop) {
        if (!(object && object[prop])) return null;
        return _.isFunction(object[prop]) ? object[prop]() : object[prop];
    };

    return Resthub;
});
