require(['console'], function () {

    module('console');

    // In order to verify that it works under all browser
    test("Test each console log method", function() {
        console.info("An info");
        console.debug("A debug");
        console.log("A log");
        console.warn("A warn");
        console.error("An error");
        ok(true);
    });

});
