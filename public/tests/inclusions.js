/**
 * Author: Baptiste Meurant <baptiste.meurant@gmail.com>
 * Date: 24/08/12
 * Time: 11:26
 */

require(['async'], function(async) {

    module('async');

    test('async inclusion', function() {
        ok(async, "async exists and is not undefined");
    });
});

require(['backbone'], function(Backbone) {

    module('backbone');

    test('backbone inclusion', function() {
        ok(Backbone, "Backbone exists and is not undefined");
    });
});

require(['resthub'], function(Resthub) {

    module('resthub');

    test('resthub inclusion', function() {
        ok(Resthub, "Resthub exists and is not undefined");
    });
});

require(['backbone-validation'], function(BackboneValidation) {

    module('backbone-validation');

    test('backbone-validation inclusion', function() {
        ok(BackboneValidation, "backbone-validation exists and is not undefined");
    });
});

require(['backbone-paginator'], function(BackbonePaginator) {

    module('backbone-paginator');

    test('backbone-paginator inclusion', function() {
        ok(BackbonePaginator, "backbone-paginator exists and is not undefined");
    });
});

require(['backbone', 'backbone-queryparams'], function(Backbone) {

    module('backbone-queryparams');

    test('backbone-queryparams inclusion', function() {
        ok(Backbone.History.prototype.getQueryParameters, "backbone-queryparams exists and is not undefined");
    });
});

require(['keymaster'], function(key) {

    module('keymaster');

    test('keymaster inclusion', function() {
        ok(key, "keymaster exists and is not undefined");
    });
});

require(['backbone', 'backbone-relational'], function(Backbone) {

	module('backbone-relational');

	test('backbone-relational inclusion', function() {
        ok(Backbone.RelationalModel, "backbone-relational exists and is not undefined");
    });
});
