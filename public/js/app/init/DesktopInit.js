// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
require(["App", "router/app-router", "jquery", "backbone", "marionette"],
    function(App, AppRouter) {
        // App.appRouter = new AppRouter({
        //     controller: new AppController()
        // });
        App.appRouter = new AppRouter();
        // Start Marionette Application in desktop mode (default)
        App.start();

    });