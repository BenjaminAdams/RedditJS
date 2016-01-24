require(["App", "router/app-router", "backbone", "marionette"],
  function(App, AppRouter, Backbone, Marionette) {

    //so Marionette inspector works
    if (window.__agent) {
      window.__agent.start(Backbone, Marionette);
    }
    App.appRouter = new AppRouter();
    App.start();

  });
