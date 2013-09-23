require(['jquery', 'backbone', 'resthub'], function($, Backbone, Resthub) {

    module("backbone-history", {
        
        setup: function() {
            
            this.testView = Resthub.View.extend({
                root: "#qunit-fixture #main",
                
                template: function() {
                    return '<a id="aTest" href="/route1">route1</a><a id="aTest2" href="/route2">route2</a><a id="aTest3" href="/">route3</a>';
                },
                
                initialize: function() {
                    this.render();
                }
            });

            this.testRouter = Backbone.Router.extend({
        
                routes: {
                    'route1': 'route1',
                    'route2': 'route2',
                    'route3': 'route3'
                },
           
                route1: function() {
                    ok(true);
                    start();
                },

                route2: function() {
                    ok(true);
                    start();
                },
            
                route3: function() {
                    
                }
            });
        }
    });
    
    var initHistory = function() {
        Backbone.history.stop();
        Backbone.history.start({
            pushState: true, 
            root: "/tests"
        });
    }
    
    asyncTest("Route1", 1, function() {
        new this.testView();
        new this.testRouter();
        initHistory();
        
        QUnit.triggerEvent($("#aTest").get(0), "click");
    });
    
    asyncTest("Route2", 2, function() {
        new this.testView();
        new this.testRouter();
        initHistory();
        
        QUnit.triggerEvent($("#aTest2").get(0), "click");
        QUnit.triggerEvent($("#aTest3").get(0), "click");
    });
});