var router = {};

router.addRouter = function(app) {
    app.$$routes = app.routes;
    app.routes = routesHandler;

    app.$$launch = app.launch;
    app.launch = launchHandler;

    app.$$intent = app.intent;
    app.intent = intentHandler;

    function routesHandler(routes, config) {
        app.$$routeList = routes;
        app.$$routeConfig = config;
    }

    function launchHandler(handler) {
        app.$$launch.apply(this, arguments);
    }

    function intentHandler(handler) {
        app.$$intent.apply(this, arguments);
    }

    return app;
};

module.exports = router;