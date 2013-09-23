require(["jquery", "underscore", "backbone", "resthub", "underscore-string"], function($, _, Backbone, Resthub, _s) {

    module("backbone-populate-model", {
        setup: function() {

            var Person = Backbone.Model.extend({initialize: function() {
            }});

            this.TestView = Resthub.View.extend({
                initialize: function() {
                    this.render();
                },

                render: function() {
                    this.$el.html("<form id='myForm'><input type='text' name='name' value='myName'/><input type='email' name='email' value='email@email.fr'/></form>");
                    $("#qunit-fixture #main").html(this.el);
                }
            });

            this.TestView2 = Resthub.View.extend({
                initialize: function() {
                    this.model = new Person();
                    this.model2 = new Person();
                    this.render();
                },

                render: function() {
                    this.$el.html("<form id='myForm'><input type='text' name='name' value='myName'/><input type='email' name='email' value='email@email.fr'/></form>");
                    $("#qunit-fixture #main").html(this.el);
                }
            });

            this.TestView3 = Resthub.View.extend({

                tagName: 'form',

                attributes: {
                    id: 'myForm'
                },

                initialize: function() {
                    this.model = new Person();
                    this.render();
                },

                render: function() {
                    this.$el.html("<input type='text' name='name' value='myName'/><input type='email' name='email' value='email@email.fr'/>");
                    $("#qunit-fixture #main").html(this.el);
                }
            });

            this.TestView4 = Resthub.View.extend({
                initialize: function() {
                    this.model = new Person();
                    this.render();
                },

                render: function() {
                    this.$el.html("<form id='myForm'><input type='text' name='name' value='myName'/><input type='email' name='email' value='email@email.fr'/><textarea name='description'>description</textarea></form>");
                    $("#qunit-fixture #main").html(this.el);
                }
            });

            this.TestView5 = Resthub.View.extend({
                initialize: function() {
                    this.model = new Person();
                    this.model2 = new Person();
                    this.render();
                },

                render: function() {
                    this.$el.html("<form id='myForm'><input type='text' name='name' value='myName'/><input type='email' name='email' value='email@email.fr'/><input type='button' name='input' value='Input'/></form>");
                    $("#qunit-fixture #main").html(this.el);
                }
            });

            this.TestView6 = Resthub.View.extend({
                initialize: function() {
                    this.model = new Person();
                    this.render();
                },

                render: function() {
                    this.$el.html("<form id='myForm'><input type='text' name='name' value='myName'/><input type='email' name='email' value='email@email.fr'/><textarea name='description'>description</textarea><select name='list'><option selected='selected' value='7'>value</option></select></form>");
                    $("#qunit-fixture #main").html(this.el);
                }
            });

            this.TestView7 = Resthub.View.extend({
                initialize: function() {
                    this.model = new Person();
                    this.render();
                },

                render: function() {
                    this.$el.html("<form id='myForm'><input type='radio' name='myRadio' value='myRadio1' checked='true'/><input type='radio' name='myRadio' value='myRadio2'/><input type='radio' name='myRadio' value='myRadio3'/></form>");
                    $("#qunit-fixture #main").html(this.el);
                }
            });

            this.TestView8 = Resthub.View.extend({
                initialize: function() {
                    this.model = new Person();
                    this.render();
                },

                render: function() {
                    this.$el.html("<form id='myForm'><input type='checkbox' name='check' value='check1' checked='true'/><input type='checkbox' name='check' value='check2' checked='true'/><input type='checkbox' name='check' value='check3'/></form>");
                    $("#qunit-fixture #main").html(this.el);
                }
            });

            this.TestView9 = Resthub.View.extend({
                initialize: function() {
                    this.model = new Person();
                    this.render();
                },

                render: function() {
                    this.$el.html("<form id='myForm'><input type='checkbox' name='check' value='true' checked='true'/></form>");
                    $("#qunit-fixture #main").html(this.el);
                }
            });

            this.TestView10 = Resthub.View.extend({
                initialize: function() {
                    this.model = new Person();
                    this.render();
                },

                render: function() {
                    this.$el.html("<form id='myForm'><input type='checkbox' name='check' value='true'/></form>");
                    $("#qunit-fixture #main").html(this.el);
                }
            });
        },
        teardown: function() {
        }
    });

    test("View should be rendered", 1, function() {
        new this.TestView();

        ok($("#qunit-fixture > #main > div").find("myForm"), "HTML content should be rendered");
    });

    test("no error if no model", 1, function() {
        var testView = new this.TestView();
        testView.populateModel();

        ok(true, "no error");
    });

    test("model should be set with default values", 3, function() {
        var testView = new this.TestView2();
        testView.populateModel();

        ok(testView.model, "model defined");
        equal(testView.model.get('name'), "myName", "model name set");
        equal(testView.model.get('email'), "email@email.fr", "model email set");
    });

    test("model should be set with explicit jquery form element", 3, function() {
        var testView = new this.TestView2();
        testView.populateModel($("#myForm"));

        ok(testView.model, "model defined");
        equal(testView.model.get('name'), "myName", "model name set");
        equal(testView.model.get('email'), "email@email.fr", "model email set");
    });

    test("model should be set with explicit jquery selector", 3, function() {
        var testView = new this.TestView2();
        testView.populateModel("#myForm");

        ok(testView.model, "model defined");
        equal(testView.model.get('name'), "myName", "model name set");
        equal(testView.model.get('email'), "email@email.fr", "model email set");
    });

    test("no error with inexistent form", 6, function() {
        var testView = new this.TestView2();
        testView.populateModel("#noForm");

        ok(testView.model, "model defined");
        equal(testView.model.get('name'), undefined, "model name undefined");
        equal(testView.model.get('email'), undefined, "model email undefined");

        testView.populateModel($("#noForm"));

        ok(testView.model, "model defined");
        equal(testView.model.get('name'), undefined, "model name undefined");
        equal(testView.model.get('email'), undefined, "model email undefined");
    });

    test("model should be set with explicit model", 6, function() {
        var testView = new this.TestView2();
        testView.populateModel(null, testView.model2);

        ok(testView.model, "model defined");
        equal(testView.model.get('name'), undefined, "model name undefined");
        equal(testView.model.get('email'), undefined, "model email undefined");

        ok(testView.model2, "model2 defined");
        equal(testView.model2.get('name'), "myName", "model name set");
        equal(testView.model2.get('email'), "email@email.fr", "model email set");
    });

    test("model should be set with explicit model and form", 6, function() {
        var testView = new this.TestView2();
        testView.populateModel($("#myForm"), testView.model2);

        ok(testView.model, "model defined");
        equal(testView.model.get('name'), undefined, "model name undefined");
        equal(testView.model.get('email'), undefined, "model email undefined");

        ok(testView.model2, "model2 defined");
        equal(testView.model2.get('name'), "myName", "model name set");
        equal(testView.model2.get('email'), "email@email.fr", "model email set");
    });

    test("el as form should be detected", 3, function() {
        var testView = new this.TestView3();
        testView.populateModel();

        ok(testView.model, "model defined");
        equal(testView.model.get('name'), "myName", "model name set");
        equal(testView.model.get('email'), "email@email.fr", "model email set");
    });

    test("textarea should not be ignored", 4, function() {
        var testView = new this.TestView4();
        testView.populateModel();

        ok(testView.model, "model defined");
        equal(testView.model.get('name'), "myName", "model name set");
        equal(testView.model.get('email'), "email@email.fr", "model email set");
        equal(testView.model.get('description'), "description", "model description set");
    });

    test("input type button should be ignored", 4, function() {
        var testView = new this.TestView5();
        testView.populateModel();

        ok(testView.model, "model defined");
        equal(testView.model.get('name'), "myName", "model name set");
        equal(testView.model.get('email'), "email@email.fr", "model email set");
        equal(testView.model.get('input'), undefined, "input ignored");
    });

    test("select should not be ignored", 5, function() {
        var testView = new this.TestView6();
        testView.populateModel();

        ok(testView.model, "model defined");
        equal(testView.model.get('name'), "myName", "model name set");
        equal(testView.model.get('email'), "email@email.fr", "model email set");
        equal(testView.model.get('description'), "description", "model description set");
        equal(testView.model.get('list'), "7", "model list set");
    });

    test("radio should not be ignored", 3, function() {
        var testView = new this.TestView7();
        testView.populateModel();

        ok(testView.model, "model defined");
        var modelRadio = testView.model.get('myRadio');
        ok(modelRadio != undefined && modelRadio != null, "model check set");
        equal(modelRadio, "myRadio1", "model radio option is correct");
    });

    test("checkbox with multiple values should not be ignored and managed as array", 6, function() {
        var testView = new this.TestView8();
        testView.populateModel();

        ok(testView.model, "model defined");
        var modelCheck = testView.model.get('check');
        ok(modelCheck != undefined && modelCheck != null, "model check set");
        ok(_.isArray(modelCheck), "model check is array");
        equal(modelCheck.length, 2, "model check size is correct an contains only checked values");
        equal(modelCheck[0], "check1", "model check value [0] is correct");
        equal(modelCheck[1], "check2", "model check value [1] is correct");
    });

    test("checkbox with selected single value should not be ignored", 4, function() {
        var testView = new this.TestView9();
        testView.populateModel();

        ok(testView.model, "model defined");
        var modelCheck = testView.model.get('check');
        ok(modelCheck != undefined && modelCheck != null, "model check set");
        ok(!_.isArray(modelCheck), "model check is not array");
        equal(modelCheck, "true", "model check selected value correct");
    });

    test("checkbox with unselected single value should not be ignored and managed as boolean string", 5, function() {
        var testView = new this.TestView10();
        testView.populateModel();

        ok(testView.model, "model defined");
        var modelCheck = testView.model.get('check');
        ok(modelCheck != undefined && modelCheck != null, "model check set");
        ok(!_.isArray(modelCheck), "model check is not array");
        ok(!_s.isBlank(modelCheck), "model check is not blank");
        equal(modelCheck, "false", "model check selected value correct");
    });
});
