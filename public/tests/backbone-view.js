require(["jquery", "underscore", "backbone", "resthub", "handlebars"], function ($, _, Backbone, Resthub, Handlebars) {

  module("backbone-view", {
    setup: function () {

      this.TestView = Resthub.View.extend({

        attributes: {
          id: 'myElement'
        }
      });

      this.TestView2 = Resthub.View.extend({
        attributes: {
          id: 'myElement2'
        }
      });

      this.TestViewWithDynamicContext = Resthub.View.extend({
        attributes: {
          id: 'myElement'
        },
        context: function() {
                    return {
                        custom:  5
                    };
        }    
      });

      this.TestViewWithContext = Resthub.View.extend({
        attributes: {
          id: 'myElement'
        },
        context: {
                      custom:  5
                  }
      });

      this.TestViewWithModelAndContext = Resthub.View.extend({
        attributes: {
          id: 'myElement'
        },
        model: new Backbone.Model({name: "test"}),
        context: {
                      custom:  5
                  }
      });

    },
    teardown: function () {
    }
  });

  test("View should be rendered in existing root", 2, function () {
    new this.TestView({root: $("#qunit-fixture > #main")});

    equal($("#qunit-fixture > #main").find("#myElement").length, 1, "HTML content should be rendered in jquery root");

    new this.TestView2({root: "#qunit-fixture > #main"});

    equal($("#qunit-fixture > #main").find("#myElement2").length, 1, "HTML content should be rendered in DOM root");
  });

  test("Non existing root should raise error", 2, function () {
    throws(function () {
        new this.TestView({root: $("#nonExistingRoot")});
      },
      function (err) {
        return err.message === 'Root element "#nonExistingRoot" does not exist or is not unique.';
      },
      'Non existing jquery root should raise error.'
    );

    throws(function () {
        new this.TestView2({root: "#nonExistingRoot"});
      },
      function (err) {
        return err.message === 'Root element "#nonExistingRoot" does not exist or is not unique.';
      },
      'Non existing DOM root should raise error.'
    );
  });

  test("Multiple roots should raise error", 2, function () {
    $("#qunit-fixture > #main").append("<div></div>").append("<div></div>");
    throws(function () {
        new this.TestView({root: $("#qunit-fixture > #main > div")});
      },
      function (err) {
        return err.message === 'Root element "#qunit-fixture > #main > div" does not exist or is not unique.';
      },
      'Multiple jquery roots should raise error.'
    );

    throws(function () {
        new this.TestView2({root: "#qunit-fixture > #main > div"});
      },
      function (err) {
        return err.message === 'Root element "#qunit-fixture > #main > div" does not exist or is not unique.';
      },
      'Multiple DOM roots should raise error.'
    );
  });

  test("Default strategy should replace root content", 3, function () {
    $("#qunit-fixture > #main").append("<div id='first'></div>").append("<div id='last'></div>");

    ok($("#qunit-fixture > #main").find("#first").length === 1 && $("#qunit-fixture > #main").find("#last").length === 1 , "root initialy contains elements");

    new this.TestView({root: $("#qunit-fixture > #main")});

    ok($("#qunit-fixture > #main").find("#first").length === 0 && $("#qunit-fixture > #main").find("#last").length === 0 , "Default strategy : root content should be replaced");
    equal($("#qunit-fixture > #main").find("#myElement").length, 1, "Default strategy : HTML content should be rendered in root");
  });

  test("Replace strategy should replace root content", 3, function () {
    $("#qunit-fixture > #main").append("<div id='first'></div>").append("<div id='last'></div>");

    ok($("#qunit-fixture > #main").find("#first").length === 1 && $("#qunit-fixture > #main").find("#last").length === 1 , "root initialy contains elements");

    new this.TestView({root: $("#qunit-fixture > #main"), strategy: 'replace'});

    ok($("#qunit-fixture > #main").find("#first").length === 0 && $("#qunit-fixture > #main").find("#last").length === 0 , "Replace strategy : root content should be replaced");
    equal($("#qunit-fixture > #main").find("#myElement").length,  1, "Replace strategy : HTML content should be rendered in root");
  });

  test("Append strategy should append to root content", 5, function () {
    $("#qunit-fixture > #main").append("<div id='first'></div>").append("<div id='last'></div>");

    ok($("#qunit-fixture > #main").find("#first").length === 1 && $("#qunit-fixture > #main").find("#last").length === 1 , "root initialy contains elements");

    new this.TestView({root: $("#qunit-fixture > #main"), strategy: 'append'});

    equal($("#qunit-fixture > #main > div").length, 3, "Append strategy : root should contain both existing element and view's el");
    ok($("#qunit-fixture > #main").find("#first").length === 1 && $("#qunit-fixture > #main").find("#last").length === 1 , "Append strategy : root content should not be replaced");
    equal($("#qunit-fixture > #main").find("#myElement").length, 1, "Append strategy : HTML content should be rendered in root");
    equal($("#qunit-fixture > #main > div").get(2).id, 'myElement', "Append strategy : view's el inserted after existing elements");
  });

  test("Prepend strategy should prepend to root content", 5, function () {
    $("#qunit-fixture > #main").append("<div id='first'></div>").append("<div id='last'></div>");

    ok($("#qunit-fixture > #main").find("#first").length === 1 && $("#qunit-fixture > #main").find("#last").length === 1 , "root initialy contains elements");

    new this.TestView({root: $("#qunit-fixture > #main"), strategy: 'prepend'});

    equal($("#qunit-fixture > #main > div").length, 3, "Prepend strategy : root should contain both existing element and view's el");
    ok($("#qunit-fixture > #main").find("#first").length === 1 && $("#qunit-fixture > #main").find("#last").length === 1 , "Prepend strategy : root content should not be replaced");
    equal($("#qunit-fixture > #main").find("#myElement").length, 1, "Prepend strategy : HTML content should be rendered in root");
    equal($("#qunit-fixture > #main > div").get(0).id, 'myElement', "Prepend strategy : view's el inserted before existing elements");
  });

  test("Default render should render provided template", 2, function () {
    var testView = new this.TestView({root: $("#qunit-fixture > #main")});
    testView.template = function () {return "<p>this is a test</p>"};
    testView.render();

    equal($("#qunit-fixture > #main").find("#myElement").length, 1, "HTML content should be rendered in root");
    ok($("#qunit-fixture > #main").find("#myElement p").length === 1 && $("#qunit-fixture > #main").find("#myElement p").html() == "this is a test", "root should contain rendered template");
  });

  test("Default render should render provided template with model", 4, function () {
    var testView = new this.TestView({root: $("#qunit-fixture > #main"), model: {name: 'test'}});
    testView.template = Handlebars.compile("<p>this is a {{model.name}}</p>");
    testView.render();

    equal($("#qunit-fixture > #main").find("#myElement").length, 1, "HTML content should be rendered in root");
    ok($("#qunit-fixture > #main").find("#myElement p").length === 1 && $("#qunit-fixture > #main").find("#myElement p").html() == "this is a test", "root should contain rendered template with model in initializer");

    $("#qunit-fixture > #main").empty();

    testView = new this.TestView({root: $("#qunit-fixture > #main")});
    testView.template = Handlebars.compile("<p>this is a {{model.name}}</p>");
    testView.render({model: {name: 'test'}});

    equal($("#qunit-fixture > #main").find("#myElement").length, 1, "HTML content should be rendered in root");
    ok($("#qunit-fixture > #main").find("#myElement p").length === 1 && $("#qunit-fixture > #main").find("#myElement p").html() == "this is a test", "root should contain rendered template with model in render");
  });

  test("Default render should render provided template with collection", 4, function () {
    var testView = new this.TestView({root: $("#qunit-fixture > #main"), collection: new Backbone.Collection([{name: 'test'},{name: 'test2'}])});
    testView.template = Handlebars.compile("<ul>{{#each collection}}<li>this is a {{this.name}}</li>{{/each}}</ul>");
    testView.render();

    equal($("#qunit-fixture > #main").find("#myElement").length, 1, "HTML content should be rendered in root");
    ok($("#qunit-fixture > #main").find("#myElement li").length === 2 && $($("#qunit-fixture > #main").find("#myElement li").get(0)).html() == "this is a test", "root should contain rendered template with collection in initializer");

    $("#qunit-fixture > #main").empty();

    testView = new this.TestView({root: $("#qunit-fixture > #main")});
    testView.template = Handlebars.compile("<ul>{{#each collection}}<li>this is a {{this.name}}</li>{{/each}}</ul>");
    testView.render({collection: new Backbone.Collection([{name: 'test'},{name: 'test2'}]).toJSON()});

    equal($("#qunit-fixture > #main").find("#myElement").length, 1, "HTML content should be rendered in root");
    ok($("#qunit-fixture > #main").find("#myElement li").length === 2 && $($("#qunit-fixture > #main").find("#myElement li").get(0)).html() == "this is a test", "root should contain rendered template with collection in render");
  });

  test("View default render should work with dynamic context", 2, function () {
    var testView = new this.TestViewWithDynamicContext({root: $("#qunit-fixture > #main"), model: new Backbone.Model({name: 'test'})});
    testView.template = Handlebars.compile("<p>this is a {{model.name}} number {{custom}}</p>");
    testView.render();

    equal($("#qunit-fixture > #main").find("#myElement").length, 1, "HTML content should be rendered in root");
    ok($("#qunit-fixture > #main").find("#myElement p").length === 1 && $("#qunit-fixture > #main").find("#myElement p").html() == "this is a test number 5", "root should contain rendered template with dynamic context");
  });

  test("View default render should work with both this.context + render called with params", 2, function () {
    var testView = new this.TestViewWithContext({root: $("#qunit-fixture > #main")});
    testView.template = Handlebars.compile("<p>this is a {{name}} number {{custom}}</p>");
    testView.render({name: 'test'});

    equal($("#qunit-fixture > #main").find("#myElement").length, 1, "HTML content should be rendered in root");
    ok($("#qunit-fixture > #main").find("#myElement p").length === 1 && $("#qunit-fixture > #main").find("#myElement p").html() == "this is a test number 5", "root should contain rendered template with both context and this.context values");
  });

  test("View default render should work with this.model, this.context + render called with model params", 2, function () {
    var testView = new this.TestViewWithModelAndContext({root: $("#qunit-fixture > #main")});
    testView.template = Handlebars.compile("<p>this is a {{model.name}} number {{custom}} with {{model.name2}}</p>");
    testView.render(new Backbone.Model({name2: 'test2'}));

    equal($("#qunit-fixture > #main").find("#myElement").length, 1, "HTML content should be rendered in root");
    ok($("#qunit-fixture > #main").find("#myElement p").length === 1 && $("#qunit-fixture > #main").find("#myElement p").html() == "this is a test number 5 with test2", "root should contain rendered template with both context and this.context values");
  });

  

});
