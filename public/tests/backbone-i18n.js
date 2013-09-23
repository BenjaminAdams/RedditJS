require(["jquery",
         "resthub",
         "i18n!../tests/nls/labels",
         "i18n!../tests/nls/zz-qq/labels",
         "hbs!../tests/templates/template2"],
function($, Resthub, labels, labels_zzqq, template2) {

    module("backbone-i18n", {
        setup: function() {
            this.TestView = Resthub.View.extend({
                labels: labels,
                template: template2,
                root: "#qunit-fixture #main",
                
                initialize: function() {
                    this.render();
                }
            });
            
            this.TestView2 = Resthub.View.extend({
                template: template2,
                root: "#qunit-fixture #main",
                
                initialize: function() {
                    this.render();
                }
            });
            
            this.TestView3 = Resthub.View.extend({
                labels: labels_zzqq,
                template: template2,
                root: "#qunit-fixture #main",
                
                initialize: function() {
                    this.render();
                }
            });
        },
        teardown: function() {
        }
    });

    test("'labels.val' should be remplaced by 'value'", 1, function() {
        new this.TestView();

        equal($("#qunit-fixture > #main > div").html(), "This is a value from labels.");
    });

    test("'labels.val' should not be rendered", 1, function() {
        new this.TestView2();

        ok($("#qunit-fixture > #main > div").html().indexOf("valeur") === -1);
    });

    test("'labels.val' should be remplaced by 'valeur'", 1, function() {
        new this.TestView3();

        equal($("#qunit-fixture > #main > div").html(), "This is a valeur from labels.");
    });
});
