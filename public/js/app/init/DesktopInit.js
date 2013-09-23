// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
require(["App", "router/app-router", "controllers/Controller", "jquery", "backbone", "marionette", "bootstrap"],
    function(App, AppRouter, AppController) {
        App.appRouter = new AppRouter({
            controller: new AppController()
        });
        // Start Marionette Application in desktop mode (default)
        App.start();

    });