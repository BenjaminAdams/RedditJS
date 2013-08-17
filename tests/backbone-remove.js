require(["jquery", "backbone", "resthub"], function($, Backbone, Resthub) {

    module("backbone-remove", {
        setup: function() {
            this.TestView = Resthub.View.extend({
                initialize: function() {
                    this.text = 'HTML Content';
                    this.render();
                },

                render: function() {
                    this.$el.html(this.text);
                    $("#qunit-fixture #main").html(this.el);
                }
            });
            this.TestView2 = Resthub.View.extend({
                initialize: function() {
                    this.counts = {};
                    this.text = 'HTML Content 2';
                    this.listenTo(this, 'destroy', function() { this.counts.destroy = (this.counts.destroy || 0) + 1; });
                    this.render();
                },

                render: function() {
                    this.$el.html(this.text);
                    $("#qunit-fixture #main").html(this.el);
                },

                stopListening: function() {
                    this.counts.stopListening = (this.counts.stopListening || 0) + 1;
                }
            });
        },
        teardown: function() {
        }
    });

    test("View should be rendered", 1, function() {
        var testView = new this.TestView();

        equal($("#qunit-fixture > #main > div").html(), testView.text, "HTML content should be rendered");
    });

    test("remove should delete html", 1, function() {
        var testView = new this.TestView();
        testView.remove();

        equal($("#qunit-fixture #main").html(), "", "no HTML content should be rendered");
    });

    test("remove on parent should call stopListening", 1, function() {
        var testView = new this.TestView2();

        testView.$el.parent().remove();
        equal(testView.counts.stopListening, 1, "stopListening called");
    });

    test("html should not call stopListening", 1, function() {
        var testView = new this.TestView2();

        testView.$el.html("test");
        equal(testView.counts.stopListening, undefined, "stopListening not called");
    });

    test("html on parents should call stopListening", 2, function() {
        var testView = new this.TestView2();

        testView.$el.parent().html("test");
        equal(testView.counts.stopListening, 1, "stopListening called");

        testView = new this.TestView2();

        testView.$el.parent().parent().html("test");
        equal(testView.counts.stopListening, 1, "stopListening called");
    });

    test("empty should not call stopListening", 1, function() {
        var testView = new this.TestView2();

        testView.$el.empty();
        equal(testView.counts.stopListening, undefined, "stopListening not called");
    });

    test("empty on parents should call stopListening", 2, function() {
        var testView = new this.TestView2();

        testView.$el.parent().empty();
        equal(testView.counts.stopListening, 1, "stopListening called");

        testView = new this.TestView2();

        testView.$el.parent().parent().empty();
        equal(testView.counts.stopListening, 1, "stopListening called");
    });

     test("remove on parent should trigger destroy event", 1, function() {
        var testView = new this.TestView2();

        testView.$el.parent().remove();
        equal(testView.counts.destroy, 1, "destroy triggered");
    });

     test("html should not trigger destroy event", 1, function() {
        var testView = new this.TestView2();

        testView.$el.html("test");
        equal(testView.counts.destroy, undefined, "destroy not triggered");
    });

     test("html on parents should trigger destroy event", 2, function() {
        var testView = new this.TestView2();

        testView.$el.parent().html("test");
        equal(testView.counts.destroy, 1, "destroy triggered");

        testView = new this.TestView2();

        testView.$el.parent().parent().html("test");
        equal(testView.counts.destroy, 1, "destroy triggered");
    });

    test("empty should not trigger destroy event", 1, function() {
        var testView = new this.TestView2();

        testView.$el.empty();
        equal(testView.counts.destroy, undefined, "destroy not triggered");
    });

    test("empty on parents should trigger destroy event", 2, function() {
        var testView = new this.TestView2();

        testView.$el.parent().empty();
        equal(testView.counts.destroy, 1, "destroy triggered");

        testView = new this.TestView2();

        testView.$el.parent().parent().empty();
        equal(testView.counts.destroy, 1, "destroy triggered");
    });

});
