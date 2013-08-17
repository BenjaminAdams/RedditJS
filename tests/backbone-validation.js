require(["backbone", "resthub", "jquery", "underscore", "../tests/validation/model1", "../tests/validation/model2", "backbone-validation"], function(Backbone, Resthub, $, _, model1, model2) {

    var nbGetCalled;

    module("resthub-backbone-validation", {
        setup: function() {
            nbGetCalled = 0;

            this.Model1 = Backbone.Model.extend({
                className: 'org.resthub.validation.model.User',

                initialize: _.bind(function() {
                    Resthub.Validation.synchronize(this.Model1);
                }, this)
            });

            this.Model2 = Backbone.Model.extend({
                className: 'org.resthub.validation.model.User',
                includes: ['minMax', 'assertTrue', 'telephoneNumber'],

                initialize: _.bind(function() {
                    Resthub.Validation.synchronize(this.Model2);
                }, this)
            });

            this.Model3 = Backbone.Model.extend({
                className: 'org.resthub.validation.model.User',
                excludes: ['size', 'assertTrue', 'telephoneNumber'],

                initialize: _.bind(function() {
                    Resthub.Validation.synchronize(this.Model3);
                }, this)
            });

            this.Model4 = Backbone.Model.extend({
                className: 'org.resthub.validation.model.User',
                messages: {
                    'validation.Min.message': 'should be greater than {value} or equals',
                    'validation.AssertTrue.message': 'must not be false',
                    'validation.assertTrue.AssertTrue.message': 'assertTrue must be true'
                },

                initialize: _.bind(function() {
                    Resthub.Validation.synchronize(this.Model4);
                }, this),

                validation: {
                    password: {
                        pattern: /^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{6,20})$/
                    }
                }
            });

            this.Model5 = Backbone.Model.extend({
                className: 'org.resthub.validation.model.User',

                initialize: _.bind(function() {
                    Resthub.Validation.synchronize(this.Model5);
                }, this),

                validation: {
                    size: {
                        required: true,
                        rangeLength: [6, 10]
                    }
                }
            });

            this.Model6 = Backbone.Model.extend({
                className: 'org.resthub.validation.model.Other',

                initialize: _.bind(function() {
                    Resthub.Validation.synchronize(this.Model6);
                }, this)
            });

            this.Model7 = Backbone.Model.extend({
                className: 'org.resthub.validation.model.User',

                initialize: _.bind(function() {
                    Resthub.Validation.synchronize(this.Model7, function(resp) {
                        ok(resp.statusCode = 404, "status code should be provided");
                    });
                }, this)
            });

            this.Model8 = Backbone.Model.extend({
                className: 'org.resthub.validation.model.User',

                initialize: _.bind(function() {
                    Resthub.Validation.synchronize(this.Model8, {'validation.NotNull.message': 'not null message'}, function(resp) {
                        ok(resp.statusCode = 404, "status code should be provided");
                    });
                }, this)
            });

            this.mockedGet1 = function(url, data) {
                return {
                    success: function(callback) {
                        callback(model1);
                        return this;
                    },
                    error: function() {
                    }
                };
            };

            this.mockedGet2 = function(url, data) {
                return {
                    success: function(callback) {
                        callback(model2);
                        return this;
                    },
                    error: function() {
                    }
                };
            };

            this.mockedGet3 = function(url, data) {
                nbGetCalled += 1;
                return {
                    success: function(callback) {
                        callback({});
                        return this;
                    },
                    error: function() {
                    }
                };
            };

            this.mockedGet4 = function(url, data) {
                return {
                    success: function() {
                        return this;
                    },
                    error: function(callback) {
                        callback({statusCode: 404});
                    }
                };
            };

            _.extend(Backbone.Model.prototype, Backbone.Validation.mixin);
        },
        teardown: function() {
            Resthub.Validation.forceSynchroForClass("org.resthub.validation.model.User");
        }
    });

    test("Resthub.Validation should be defined", 1, function() {
        ok(Resthub.Validation, "local variable should be defined");
    });

    test("default parameters should be set", 2, function() {
        $.get = function(url, data) {
            equal(url, "api/validation/org.resthub.validation.model.User", "incorrect url");
            ok(data.locale, "locale should be defined");

            return {
                success: function(callback) {
                    callback({});
                    return this;
                },
                error: function() {
                }
            };
        }

        new this.Model1();
    });

    test("no error on empty response", 1, function() {
        $.get = function(url, data) {
            return {
                success: function(callback) {
                    callback({});
                    return this;
                },
                error: function() {
                }
            };
        }

        var model1 = new this.Model1();

        ok(_.isEmpty(model1.validation), "validation should be empty");
    });

    test("model validation populated", 23, function() {
        $.get = this.mockedGet1;

        var model1 = new this.Model1();

        ok(!_.isEmpty(model1.validation), "validation should not be empty");
        equal(_.keys(model1.validation).length, 21, "validation should contain 21 keys")

        ok(!_.isEmpty(model1.validation.url), "validation should contain url");
        ok(!_.isEmpty(model1.validation.assertTrue), "validation should contain assertTrue");
        ok(!_.isEmpty(model1.validation.min), "validation should contain min");
        ok(!_.isEmpty(model1.validation.max), "validation should contain max");
        ok(!_.isEmpty(model1.validation.range), "validation should contain range");
        ok(!_.isEmpty(model1.validation.stringSize), "validation should contain stringSize");
        ok(!_.isEmpty(model1.validation.decimalMax), "validation should contain decimalMax");
        ok(!_.isEmpty(model1.validation.decimalMin), "validation should contain decimalMax");
        ok(!_.isEmpty(model1.validation.collSize), "validation should contain collSize");
        ok(!_.isEmpty(model1.validation.url), "validation should contain url");
        ok(!_.isEmpty(model1.validation.urlRegexp), "validation should contain urlRegexp");
        ok(!_.isEmpty(model1.validation.urlComplete), "validation should contain urlComplete");
        ok(!_.isEmpty(model1.validation.pattern), "validation should contain pattern");
        ok(!_.isEmpty(model1.validation.email), "validation should contain email");
        ok(!_.isEmpty(model1.validation.notEmpty), "validation should contain notEmpty");
        ok(!_.isEmpty(model1.validation.assertFalse), "validation should contain assertFalse");
        ok(!_.isEmpty(model1.validation.creditCardNumber), "validation should contain creditCardNumber");
        ok(!_.isEmpty(model1.validation.nullValue), "validation should contain nullValue");
        ok(!_.isEmpty(model1.validation.length), "validation should contain length");
        ok(!_.isEmpty(model1.validation.notNull), "validation should contain notNull");
        ok(!_.isEmpty(model1.validation.notBlank), "validation should contain notBlank");
    });

    test("url validator", 29, function() {
        $.get = this.mockedGet1;

        var model1 = new this.Model1();

        ok(!_.isEmpty(model1.validation.urlDefault), "validation should contain urlDefault");

        ok(model1.set({"urlDefault": undefined}, {validate: true}), "urlDefault should not be required");
        var validationErrs = model1.validate({"urlDefault": "bad url"});
        ok(validationErrs && validationErrs.urlDefault, "invalid urlDefault should not be valid");
        equal(validationErrs.urlDefault, "must be a valid URL", "invalid urlDefault should hold the correct error message");
        ok(!model1.validate({"urlDefault": "http://localhost:8080/test?test=test"}), "valid http urlDefault should be valid");
        ok(!model1.validate({"urlDefault": "ftp://localhost:8080/test?test=test"}), "valid ftp urlDefault should be valid");
        ok(!model1.validate({"urlDefault": "mailto:test@test.fr"}), "valid mailto urlDefault should be valid");

        ok(!_.isEmpty(model1.validation.url), "validation should contain urlDefault");

        ok(model1.set({"url": undefined}, {validate: true}), "url should not be required");
        var validationErrs = model1.validate({"url": "bad url"});
        ok(validationErrs && validationErrs.url, "invalid url should not be valid");
        validationErrs = model1.validate({"url": "ftp://localhost:8080"});
        ok(validationErrs && validationErrs.url, "invalid ftp url should not be valid");
        validationErrs = model1.validate({"url": "http://host:8080"});
        ok(validationErrs && validationErrs.url, "invalid host url should not be valid");
        validationErrs = model1.validate({"url": "http://localhost:8181"});
        ok(validationErrs && validationErrs.url, "invalid port url should not be valid");
        equal(validationErrs.url, "must be a valid URL", "invalid url should hold the correct error message");
        ok(!model1.validate({"url": "http://localhost:8080/test?test=test"}), "valid http localhost 8080 url should be valid");

        ok(!_.isEmpty(model1.validation.urlRegexp), "validation should contain urlRegexp");

        ok(model1.set({"urlRegexp": undefined}, {validate: true}), "urlRegexp should not be required");
        var validationErrs = model1.validate({"urlRegexp": "bad url"});
        ok(validationErrs && validationErrs.urlRegexp, "invalid urlRegexp should not be valid");
        validationErrs = model1.validate({"urlRegexp": "http://localhost:8080/test"});
        ok(validationErrs && validationErrs.urlRegexp, "invalid urlRegexp pattern should not be valid");
        equal(validationErrs.urlRegexp, "must be a valid URL", "invalid urlRegexp should hold the correct error message");
        ok(!model1.validate({"urlRegexp": "http://url-test:8080/test?test=test"}), "valid regexp host url should be valid");

        ok(!_.isEmpty(model1.validation.urlComplete), "validation should contain urlComplete");

        ok(model1.set({"urlComplete": undefined}, {validate: true}), "urlComplete should not be required");
        var validationErrs = model1.validate({"urlComplete": "bad url"});
        ok(validationErrs && validationErrs.urlComplete, "invalid urlComplete should not be valid");
        validationErrs = model1.validate({"urlComplete": "http://resthub:8080/url-test.fr"});
        ok(validationErrs && validationErrs.urlComplete, "invalid http urlComplete should not be valid");
        validationErrs = model1.validate({"urlComplete": "ftp://localhost:8080/url-test.fr"});
        ok(validationErrs && validationErrs.urlComplete, "invalid host urlComplete should not be valid");
        validationErrs = model1.validate({"urlComplete": "ftp://resthub:8181/url-test.fr"});
        ok(validationErrs && validationErrs.urlComplete, "invalid port urlComplete should not be valid");
        equal(validationErrs.urlComplete, "must be a valid URL", "invalid urlComplete should hold the correct error message");
        ok(!model1.validate({"urlComplete": "ftp://resthub:8080/url-test.fr"}), "valid urlComplete should be valid");
    });

    test("assertTrue validator", 9, function() {
        $.get = this.mockedGet1;

        var model1 = new this.Model1();

        ok(!_.isEmpty(model1.validation.assertTrue), "validation should contain assertTrue");

        ok(model1.set({"assertTrue": undefined}, {validate: true}), "assertTrue should not be required");
        ok(model1.set({"assertTrue": null}, {validate: true}), "assertTrue should not be required");
        ok(model1.validate({"assertTrue": "false"}), "invalid assertTrue should not be valid");
        ok(model1.validate({"assertTrue": "no"}), "invalid assertTrue should not be valid");
        var validationErrs = model1.validate({"assertTrue": false});
        ok(validationErrs && validationErrs.assertTrue, "invalid assertTrue should not be valid");
        equal(validationErrs.assertTrue, "must be true", "invalid assertTrue should hold the correct error message");

        ok(!model1.validate({"assertTrue": true}), "valid assertTrue should be valid");
        ok(!model1.validate({"assertTrue": "true"}), "valid assertTrue should be valid");
    });

    test("assertFalse validator", 9, function() {
        $.get = this.mockedGet1;

        var model1 = new this.Model1();

        ok(!_.isEmpty(model1.validation.assertFalse), "validation should contain assertFalse");

        ok(model1.set({"assertFalse": undefined}, {validate: true}), "assertFalse should not be required");
        ok(model1.set({"assertFalse": null}, {validate: true}), "assertFalse should not be required");
        ok(model1.validate({"assertFalse": "true"}), "invalid assertFalse should not be valid");
        var validationErrs = model1.validate({"assertFalse": true});
        ok(validationErrs && validationErrs.assertFalse, "invalid assertFalse should not be valid");
        equal(validationErrs.assertFalse, "must be false", "invalid assertFalse should hold the correct error message");

        ok(!model1.validate({"assertFalse": false}), "valid assertFalse should be valid");
        ok(!model1.validate({"assertFalse": "no"}), "valid assertFalse should be valid");
        ok(!model1.validate({"assertFalse": "false"}), "valid assertFalse should be valid");
    });

    test("min validator", 8, function() {
        $.get = this.mockedGet1;

        var model1 = new this.Model1();

        ok(!_.isEmpty(model1.validation.min), "validation should contain min");

        ok(model1.set({"min": undefined}, {validate: true}), "min should not be required");
        ok(model1.set({"min": null}, {validate: true}), "min should not be required");
        ok(model1.validate({"min": "test"}), "invalid min should not be valid");
        var validationErrs = model1.validate({"min": 0});
        ok(validationErrs && validationErrs.min, "invalid min should not be valid");
        equal(validationErrs.min, "must be greater than or equal to 1", "invalid min should hold the correct error message");

        ok(!model1.validate({"min": 1}), "valid min should be valid");
        ok(!model1.validate({"min": 10}), "valid min should be valid");
    });

    test("decimalMin validator", 8, function() {
        $.get = this.mockedGet1;

        var model1 = new this.Model1();

        ok(!_.isEmpty(model1.validation.decimalMin), "validation should contain decimalMin");

        ok(model1.set({"decimalMin": undefined}, {validate: true}), "decimalMin should not be required");
        ok(model1.set({"decimalMin": null}, {validate: true}), "decimalMin should not be required");
        ok(model1.validate({"decimalMin": "test"}), "invalid decimalMin should not be valid");
        var validationErrs = model1.validate({"decimalMin": 0.4});
        ok(validationErrs && validationErrs.decimalMin, "invalid decimalMin should not be valid");
        equal(validationErrs.decimalMin, "must be greater than or equal to 0.5", "invalid decimalMin should hold the correct error message");

        ok(!model1.validate({"decimalMin": 0.5}), "valid decimalMin should be valid");
        ok(!model1.validate({"decimalMin": 10}), "valid decimalMin should be valid");
    });

    test("max validator", 8, function() {
        $.get = this.mockedGet1;

        var model1 = new this.Model1();

        ok(!_.isEmpty(model1.validation.max), "validation should contain max");

        ok(model1.set({"max": undefined}, {validate: true}), "max should not be required");
        ok(model1.set({"max": null}, {validate: true}), "max should not be required");
        ok(model1.validate({"max": "test"}), "invalid max should not be valid");
        var validationErrs = model1.validate({"max": 1001});
        ok(validationErrs && validationErrs.max, "invalid max should not be valid");
        equal(validationErrs.max, "must be less than or equal to 1000", "invalid max should hold the correct error message");

        ok(!model1.validate({"min": 500}), "valid max should be valid");
        ok(!model1.validate({"min": 1000}), "valid max should be valid");
    });

    test("decimalMax validator", 8, function() {
        $.get = this.mockedGet1;

        var model1 = new this.Model1();

        ok(!_.isEmpty(model1.validation.decimalMax), "validation should contain decimalMax");

        ok(model1.set({"decimalMax": undefined}, {validate: true}), "decimalMax should not be required");
        ok(model1.set({"decimalMax": null}, {validate: true}), "decimalMax should not be required");
        ok(model1.validate({"decimalMax": "test"}), "invalid decimalMax should not be valid");
        var validationErrs = model1.validate({"decimalMax": 100.5});
        ok(validationErrs && validationErrs.decimalMax, "invalid decimalMax should not be valid");
        equal(validationErrs.decimalMax, "must be less than or equal to 10.5", "invalid decimalMax should hold the correct error message");

        ok(!model1.validate({"decimalMax": 10.5}), "valid decimalMax should be valid");
        ok(!model1.validate({"decimalMax": 10}), "valid decimalMax should be valid");
    });

    test("range validator", 10, function() {
        $.get = this.mockedGet1;

        var model1 = new this.Model1();

        ok(!_.isEmpty(model1.validation.range), "validation should contain range");

        ok(model1.set({"range": undefined}, {validate: true}), "range should not be required");
        ok(model1.set({"range": null}, {validate: true}), "range should not be required");
        ok(model1.validate({"range": "test"}), "invalid range should not be valid");
        ok(model1.validate({"range": -12}), "invalid range should not be valid");
        var validationErrs = model1.validate({"range": 250});
        ok(validationErrs && validationErrs.range, "invalid range should not be valid");
        equal(validationErrs.range, "must be between 0 and 200", "invalid range should hold the correct error message");

        ok(!model1.validate({"range": 0}), "valid range should be valid");
        ok(!model1.validate({"range": 100}), "valid range should be valid");
        ok(!model1.validate({"range": 200}), "valid range should be valid");
    });

    test("size validator", 21, function() {
        $.get = this.mockedGet1;

        var model1 = new this.Model1();

        // string size validator
        ok(!_.isEmpty(model1.validation.stringSize), "validation should contain stringSize");

        ok(model1.set({"stringSize": undefined}, {validate: true}), "stringSize should not be required");
        ok(model1.set({"stringSize": null}, {validate: true}), "stringSize should not be required");
        ok(model1.validate({"stringSize": true}), "invalid stringSize should not be valid");
        ok(model1.validate({"stringSize": "t"}), "invalid stringSize should not be valid");
        var validationErrs = model1.validate({"stringSize": "testtest"});
        ok(validationErrs && validationErrs.stringSize, "invalid stringSize should not be valid");
        equal(validationErrs.stringSize, "size must be between 2 and 5", "invalid stringSize should hold the correct error message");

        ok(!model1.validate({"stringSize": "tt"}), "valid stringSize should be valid");
        ok(!model1.validate({"stringSize": "ttt"}), "valid stringSize should be valid");
        ok(!model1.validate({"stringSize": "ttttt"}), "valid stringSize should be valid");

        // collection size validator
        ok(!_.isEmpty(model1.validation.collSize), "validation should contain collSize");

        ok(model1.set({"collSize": undefined}, {validate: true}), "collSize should not be required");
        ok(model1.set({"collSize": null}, {validate: true}), "collSize should not be required");
        ok(model1.validate({"collSize": true}), "invalid collSize should not be valid");
        ok(model1.validate({"collSize": []}), "invalid collSize should not be valid");
        ok(model1.validate({"collSize": [1]}), "invalid collSize should not be valid");
        var validationErrs = model1.validate({"collSize": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]});
        ok(validationErrs && validationErrs.collSize, "invalid collSize should not be valid");
        equal(validationErrs.collSize, "size must be between 2 and 10", "invalid collSize should hold the correct error message");

        ok(!model1.validate({"collSize": [1, 2]}), "valid collSize should be valid");
        ok(!model1.validate({"collSize": [1, 2, 3, 4, 5]}), "valid collSize should be valid");
        ok(!model1.validate({"collSize": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}), "valid collSize should be valid");
    });

    test("pattern validator", 10, function() {
        $.get = this.mockedGet1;

        var model1 = new this.Model1();

        ok(!_.isEmpty(model1.validation.pattern), "validation should contain pattern");

        ok(model1.set({"pattern": undefined}, {validate: true}), "pattern should not be required");
        ok(model1.set({"pattern": null}, {validate: true}), "pattern should not be required");
        ok(model1.validate({"pattern": "test"}), "invalid pattern should not be valid");
        ok(model1.validate({"pattern": true}), "invalid pattern should not be valid");
        var validationErrs = model1.validate({"pattern": "01"});
        ok(validationErrs && validationErrs.pattern, "invalid pattern should not be valid");
        equal(validationErrs.pattern, "must match \"^(0|[1-9][0-9]*)$\"", "invalid pattern should hold the correct error message");

        ok(!model1.validate({"pattern": "0"}), "valid pattern should be valid");
        ok(!model1.validate({"pattern": "100"}), "valid pattern should be valid");
        ok(!model1.validate({"pattern": "9999"}), "valid pattern should be valid");
    });

    test("email validator", 10, function() {
        $.get = this.mockedGet1;

        var model1 = new this.Model1();

        ok(!_.isEmpty(model1.validation.email), "validation should contain email");

        ok(model1.set({"email": undefined}, {validate: true}), "email should not be required");
        ok(model1.set({"email": null}, {validate: true}), "email should not be required");
        ok(model1.validate({"email": "test"}), "invalid email should not be valid");
        ok(model1.validate({"email": true}), "invalid email should not be valid");
        var validationErrs = model1.validate({"email": "01"});
        ok(validationErrs && validationErrs.email, "invalid email should not be valid");
        equal(validationErrs.email, "not a well-formed email address", "invalid email should hold the correct error message");

        ok(!model1.validate({"email": "test@test.fr"}), "valid email should be valid");
        ok(!model1.validate({"email": "test-test@test.fr"}), "valid email should be valid");
        ok(!model1.validate({"email": "test.test@test.fr"}), "valid email should be valid");
    });

    test("notEmpty validator", 8, function() {
        $.get = this.mockedGet1;

        var model1 = new this.Model1();

        ok(!_.isEmpty(model1.validation.notEmpty), "validation should contain notEmpty");

        ok(model1.validate({"notEmpty": undefined}), "notEmpty should be required");
        ok(model1.validate({"notEmpty": null}), "notEmpty should be required");
        ok(model1.validate({"notEmpty": ""}), "invalid notEmpty should not be valid");
        ok(model1.validate({"notEmpty": "   "}), "valid notEmpty should not be valid");
        var validationErrs = model1.validate({"notEmpty": []});
        ok(validationErrs && validationErrs.notEmpty, "invalid notEmpty should not be valid");
        equal(validationErrs.notEmpty, "may not be empty", "invalid notEmpty should hold the correct error message");

        ok(!model1.validate({"notEmpty": "aaa"}), "valid notEmpty should be valid");
    });

    test("notBlank validator", 8, function() {
        $.get = this.mockedGet1;

        var model1 = new this.Model1();

        ok(!_.isEmpty(model1.validation.notBlank), "validation should contain notBlank");

        ok(model1.validate({"notBlank": undefined}), "notBlank should be required");
        ok(model1.validate({"notBlank": null}), "notBlank should be required");
        ok(model1.validate({"notBlank": ""}), "invalid notBlank should not be valid");
        ok(model1.validate({"notBlank": "  "}), "invalid notBlank should not be valid");
        var validationErrs = model1.validate({"notBlank": []});
        ok(validationErrs && validationErrs.notBlank, "invalid notBlank should not be valid");
        equal(validationErrs.notBlank, "may not be empty", "invalid notBlank should hold the correct error message");

        ok(!model1.validate({"notBlank": "aaa"}), "valid notBlank should be valid");
    });

    test("creditCardNumber validator", 12, function() {
        $.get = this.mockedGet1;

        var model1 = new this.Model1();

        ok(!_.isEmpty(model1.validation.creditCardNumber), "validation should contain creditCardNumber");

        ok(model1.set({"creditCardNumber": undefined}, {validate: true}), "creditCardNumber should not be required");
        ok(model1.set({"creditCardNumber": null}, {validate: true}), "creditCardNumber should not be required");
        ok(model1.validate({"creditCardNumber": true}), "invalid creditCardNumber should not be valid");
        ok(model1.validate({"creditCardNumber": "aaaa"}), "invalid creditCardNumber should not be valid");
        ok(model1.validate({"creditCardNumber": "1234"}), "invalid creditCardNumber should not be valid");
        ok(model1.validate({"creditCardNumber": "49927398717"}), "invalid creditCardNumber should not be valid");
        ok(model1.validate({"creditCardNumber": "49927398716 "}), "invalid creditCardNumber should not be valid");
        var validationErrs = model1.validate({"creditCardNumber": "1234567812345678"});
        ok(validationErrs && validationErrs.creditCardNumber, "invalid creditCardNumber should not be valid");
        equal(validationErrs.creditCardNumber, "invalid credit card number", "invalid creditCardNumber should hold the correct error message");

        ok(!model1.validate({"creditCardNumber": "49927398716"}), "valid creditCardNumber should be valid");
        ok(!model1.validate({"creditCardNumber": "1234567812345670"}), "valid creditCardNumber should be valid");
    });

    test("notNull validator", 5, function() {
        $.get = this.mockedGet1;

        var model1 = new this.Model1();

        ok(!_.isEmpty(model1.validation.notNull), "validation should contain notNull");

        ok(model1.validate({"notNull": undefined}), "notNull should be required");
        var validationErrs = model1.validate({"notNull": null});
        ok(validationErrs && validationErrs.notNull, "invalid notNull should not be valid");
        equal(validationErrs.notNull, "may not be null", "invalid notNull should hold the correct error message");

        ok(!model1.validate({"notNull": "aaa"}), "valid notNull should be valid");
    });

    test("null validator", 5, function() {
        $.get = this.mockedGet1;

        var model1 = new this.Model1();

        ok(!_.isEmpty(model1.validation.nullValue), "validation should contain nullValue");

        ok(model1.set({"nullValue": undefined}, {validate: true}), "nullValue should not be required");

        var validationErrs = model1.validate({"nullValue": "aa"});
        ok(validationErrs && validationErrs.nullValue, "invalid nullValue should not be valid");
        equal(validationErrs.nullValue, "must be null", "invalid nullValue should hold the correct error message");

        ok(!model1.validate({"nullValue": null}), "valid nullValue should be valid");
    });

    test("length validator", 9, function() {
        $.get = this.mockedGet1;

        var model1 = new this.Model1();

        ok(!_.isEmpty(model1.validation.length), "validation should contain length");

        ok(model1.set({"length": undefined}, {validate: true}), "length should not be required");
        ok(model1.set({"length": null}, {validate: true}), "length should not be required");
        ok(model1.validate({"length": "a"}), "invalid length should not be valid");
        var validationErrs = model1.validate({"length": "aaaaaaaaaaa"});
        ok(validationErrs && validationErrs.length, "invalid length should not be valid");
        equal(validationErrs.length, "length must be between 2 and 10", "invalid length should hold the correct error message");

        ok(!model1.validate({"length": "te"}), "valid length should be valid");
        ok(!model1.validate({"length": "test"}), "valid length should be valid");
        ok(!model1.validate({"length": "testtestte"}), "valid length should be valid");
    });

    test("combined constraints", 16, function() {
        $.get = this.mockedGet2;

        var model1 = new this.Model1();

        ok(!_.isEmpty(model1.validation.minMax), "validation should contain minMax");

        ok(model1.validate({"minMax": undefined}), "minMax should be required");
        ok(model1.validate({"minMax": null}), "minMax should be required");
        var validationErrs = model1.validate({"minMax": ""});
        ok(validationErrs && validationErrs.minMax, "invalid minMax should not be valid");
        equal(validationErrs.minMax, "may not be null", "invalid minMax should hold the correct error message");

        ok(model1.validate({"minMax": "a"}), "invalid minMax should not be valid");
        ok(model1.validate({"minMax": "aaaaaaaaaaa"}), "invalid minMax should not be valid");
        ok(model1.validate({"minMax": "0"}), "invalid minMax should not be valid");
        validationErrs = model1.validate({"minMax": 0});
        ok(validationErrs && validationErrs.minMax, "invalid minMax should not be valid");
        equal(validationErrs.minMax, "must be greater than or equal to 1", "invalid minMax should hold the correct error message");

        ok(model1.validate({"minMax": "1001"}), "invalid minMax should not be valid");
        validationErrs = model1.validate({"minMax": 1001});
        ok(validationErrs && validationErrs.minMax, "invalid minMax should not be valid");
        equal(validationErrs.minMax, "must be less than or equal to 1000", "invalid minMax should hold the correct error message");

        ok(!model1.validate({"minMax": "2"}), "valid minMax should be valid");
        ok(!model1.validate({"minMax": 500}), "valid minMax should be valid");
        ok(!model1.validate({"minMax": 1000}), "valid minMax should be valid");
    });

    test("include constraints", 8, function() {
        $.get = this.mockedGet2;

        var model1 = new this.Model1();

        ok(!_.isEmpty(model1.validation.minMax), "validation should contain minMax");
        ok(!_.isEmpty(model1.validation.assertTrue), "validation should contain assertTrue");
        ok(!_.isEmpty(model1.validation.size), "validation should contain size");

        model1.set('assertTrue', true);
        model1.set('minMax', 500);
        ok(model1.validate(), "model1 should be invalid");

        Resthub.Validation.forceSynchroForClass("org.resthub.validation.model.User");
        var model2 = new this.Model2();

        ok(!_.isEmpty(model2.validation.minMax), "validation should contain minMax");
        ok(!_.isEmpty(model2.validation.assertTrue), "validation should contain assertTrue");
        ok(_.isEmpty(model2.validation.size), "validation should not contain size");

        model2.set('assertTrue', true);
        model2.set('minMax', 500);
        ok(!model2.validate(), "model2 should be valid");
    });

    test("exclude constraints", 8, function() {
        $.get = this.mockedGet2;

        var model1 = new this.Model1();

        ok(!_.isEmpty(model1.validation.minMax), "validation should contain minMax");
        ok(!_.isEmpty(model1.validation.assertTrue), "validation should contain assertTrue");
        ok(!_.isEmpty(model1.validation.size), "validation should contain size");

        model1.set('assertTrue', true);
        model1.set('minMax', 500);
        ok(model1.validate(), "model1 should be invalid");

        Resthub.Validation.forceSynchroForClass("org.resthub.validation.model.User");
        var model3 = new this.Model3();

        ok(!_.isEmpty(model3.validation.minMax), "validation should contain minMax");
        ok(_.isEmpty(model3.validation.assertTrue), "validation should not contain assertTrue");
        ok(_.isEmpty(model3.validation.size), "validation should not contain size");

        model3.set('assertTrue', true);
        model3.set('minMax', 500);
        ok(!model3.validate(), "model3 should be valid");
    });

    test("custom messages", 3, function() {
        $.get = this.mockedGet2;

        var model4 = new this.Model4();

        ok(!_.isEmpty(model4.validation.minMax), "validation should contain minMax");

        var validationErrs = model4.validate({"minMax": 0});
        ok(validationErrs && validationErrs.minMax, "invalid minMax should not be valid");
        equal(validationErrs.minMax, "should be greater than 1 or equals", "invalid minMax should hold the correct error message");
    });

    test("custom property messages", 3, function() {
        $.get = this.mockedGet2;

        var model4 = new this.Model4();

        ok(!_.isEmpty(model4.validation.assertTrue), "validation should contain assertTrue");

        var validationErrs = model4.validate({"assertTrue": false});
        ok(validationErrs && validationErrs.assertTrue, "invalid assertTrue should not be valid");
        equal(validationErrs.assertTrue, "assertTrue must be true", "invalid assertTrue should hold the correct error message");
    });

    test("adding constraints", 8, function() {
        $.get = this.mockedGet2;

        var model4 = new this.Model4();

        ok(!_.isEmpty(model4.validation.minMax), "validation should contain minMax");
        ok(!_.isEmpty(model4.validation.assertTrue), "validation should contain assertTrue");
        ok(!_.isEmpty(model4.validation.size), "validation should contain size");
        ok(!_.isEmpty(model4.validation.password), "validation should contain password");

        ok(model4.validate({"assertTrue": false}), "invalid assertTrue should not be valid");
        ok(!model4.validate({"assertTrue": "true"}), "valid assertTrue should be valid");

        ok(model4.validate({"password": "test"}), "invalid password should not be valid");
        ok(!model4.validate({"password": "L@0xt5!dh"}), "valid password should be valid");
    });

    test("overriding constraints", 8, function() {
        $.get = this.mockedGet2;

        var model5 = new this.Model5();

        ok(!_.isEmpty(model5.validation.size), "validation should contain size");
        ok(!_.isEmpty(model5.validation.assertTrue), "validation should contain assertTrue");

        ok(model5.validate({"assertTrue": false}), "invalid assertTrue should not be valid");
        ok(!model5.validate({"assertTrue": "true"}), "valid assertTrue should be valid");

        ok(model5.validate({"size": "aa"}), "invalid size should not be valid");
        ok(model5.validate({"size": "aaaaa"}), "invalid size should not be valid");
        ok(!model5.validate({"size": "aaaaaa"}), "valid size should be valid");
        ok(!model5.validate({"size": "aaaaaaaaaa"}), "valid size should be valid");
    });

    test("custom constraints", 13, function() {
        $.get = this.mockedGet2;

        var model2 = new this.Model2();

        ok(_.isEmpty(model2.validation.telephoneNumber), "validation should contain telephoneNumber");
        ok(!_.isEmpty(model2.validation.assertTrue), "validation should contain assertTrue");

        ok(model2.validate({"assertTrue": false}), "invalid assertTrue should not be valid");
        ok(!model2.validate({"assertTrue": "true"}), "valid assertTrue should be valid");

        Resthub.Validation.addValidator('TelephoneNumber', function(constraint, msg) {
            return {
                pattern: /^[+]?([0-9]*[\\.\\s\\-\\(\\)]|[0-9]+){6,24}$/,
                msg: msg
            };
        });

        Resthub.Validation.messages = {
            'validation.TelephoneNumber.message': 'telephone number is not valid'
        };

        Resthub.Validation.forceSynchroForClass("org.resthub.validation.model.User");

        model2 = new this.Model2();

        ok(!_.isEmpty(model2.validation.telephoneNumber), "validation should contain telephoneNumber");
        ok(!_.isEmpty(model2.validation.assertTrue), "validation should contain assertTrue");

        ok(model2.validate({"assertTrue": false}), "invalid assertTrue should not be valid");
        ok(!model2.validate({"assertTrue": "true"}), "valid assertTrue should be valid");

        ok(model2.validate({"telephoneNumber": "aa"}), "invalid telephoneNumber should not be valid");
        var validationErrs = model2.validate({"telephoneNumber": "04456"});
        ok(validationErrs && validationErrs.telephoneNumber, "invalid telephoneNumber should not be valid");
        equal(validationErrs.telephoneNumber, "telephone number is not valid", "invalid telephoneNumber should hold the correct error message");

        ok(!model2.validate({"telephoneNumber": "0504060707"}), "valid telephoneNumber should be valid");
        ok(!model2.validate({"telephoneNumber": "+33504060707"}), "valid telephoneNumber should be valid");
    });

    test("synchronize lifecycle", 5, function() {
        Resthub.Validation.forceSynchroForClass("org.resthub.validation.model.User");
        nbGetCalled = 0;

        $.get = this.mockedGet3;

        new this.Model1();
        equal(nbGetCalled, 1, "get should have been called once");

        new this.Model1();
        equal(nbGetCalled, 1, "get should have been called once");

        new this.Model2();
        equal(nbGetCalled, 1, "get should have been called once");

        new this.Model6();
        equal(nbGetCalled, 2, "get should have been called twice");

        Resthub.Validation.forceSynchroForClass("org.resthub.validation.model.User");

        new this.Model1();
        equal(nbGetCalled, 3, "get should have been called 3 times");
    });

    test("change locale", 6, function() {
        Resthub.Validation.forceSynchroForClass("org.resthub.validation.model.User");
        Resthub.Validation.locale("fr");
        nbGetCalled = 0;

        $.get = this.mockedGet3;

        new this.Model1();
        equal(nbGetCalled, 1, "get should have been called once");

        new this.Model1();
        equal(nbGetCalled, 1, "get should have been called once");

        Resthub.Validation.locale("fr");

        new this.Model1();
        equal(nbGetCalled, 1, "get should have been called once");

        Resthub.Validation.locale("en");

        new this.Model1();
        equal(nbGetCalled, 2, "get should have been called twice");

        Resthub.Validation.locale("fr");

        new this.Model1();
        equal(nbGetCalled, 3, "get should have been called 3 times");

        Resthub.Validation.locale("en");

        new this.Model1();
        equal(nbGetCalled, 4, "get should have been called 4 times");
    });

    test("handle errors", 4, function() {
        $.get = this.mockedGet4;

        new this.Model1();

        // test that no exception thrown
        ok(true, "no exception should be thrown");

        // test overriding global error handler
        Resthub.Validation.options.errorCallback = function(resp) {
            ok(resp.statusCode = 404, "status code should be provided");
        };

        new this.Model1();
        new this.Model7();
        new this.Model8();
    });

});
