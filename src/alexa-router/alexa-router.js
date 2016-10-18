var router = {};

router.addRouter = function(app) {
    if (!app) return;

    app.defaultRoute = '/';

    app.$$routes = app.routes;
    app.routes = routesHandler;

    app.$$launch = app.launch;
    app.launch = launchHandler;

    app.$$intent = app.intent;
    app.intent = intentHandler;

    function routesHandler(routes, config) {
        app.$$routeList = routes || {};
        app.$$routeConfig = config || {};
    }

    function launchHandler(handler) {
        app.$$launch(function (request, response) {
            response.route = function (nextRouteName) {
                response
                    .shouldEndSession(false)
                    .session('route', nextRouteName);
                return response;
            };

            return handler.apply(null, arguments);
        });
    }

    function intentHandler(name, config, handler) {
        if (typeof config == "function") {
            handler = config;
            config = null;
        }

        app.$$intent(name, config, function (request, response) {
            var routeName;
            routeName = request.session('route');
            response.session('route', null);
            console.log('Route: ' + routeName);
            console.log('Intent: ' + name);

            response.route = function (nextRouteName) {
                response
                    .shouldEndSession(false)
                    .session('route', nextRouteName);
                return response;
            };

            // Call route handler
            var routeHandler = app.$$routeList[routeName];
            var defaultRouteHandler = app.$$routeList[app.$$routeConfig.defaultRoute];

            if (routeHandler && typeof routeHandler[name] === 'function') {
                return routeHandler[name].apply(null, arguments);
            } else if (defaultRouteHandler && typeof defaultRouteHandler[name] === 'function') {
                return defaultRouteHandler[name].apply(null, arguments);
            } else {
                // Call original handler if no route matches
                return handler.apply(null, arguments);
            }
        });
    }

    return app;
};

module.exports = router;