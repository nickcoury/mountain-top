declare let exports:any;
import * as _ from 'lodash';
import * as alexa from 'alexa-app';
import * as router from 'alexa-app-router';
import * as Promise from 'bluebird';
import * as strava from 'strava-v3';
import { getCached, validateText } from './util';

import friendsHandler from './handlers/friends';
import recentActivitiesHandler from './handlers/recent';
import statsHandler from './handlers/stats';
import summaryHandler from './handlers/summary';

(function() {
    _(strava).forEach(Promise.promisifyAll);
    const app = new alexa.app('strava');

    const config = {
        defaultRoute: '/',
        pre: preHandler,
        launch: launchHandler
    };

    const intents = {
        FriendsIntent: { utterances: ['{get |give |read |}{me |my |}{friend|friends|friend\'s}{ activities|}'] },
        RecentActivitiesIntent: { utterances: ['{get |give |read |}{me |my |}{recent |}activities'] },
        StatsIntent: { utterances: ['{get |give |read |}{me |my |}{stats|statistics}'] },
        SummaryIntent: { utterances: ['{get |give |read |}{me|my |}summary'] }
    };

    const routes = {
        '/': {
            'AMAZON.CancelIntent': exitHandler,
            'AMAZON.HelpIntent': menuHandler,
            'AMAZON.StartOverIntent': launchHandler,
            'AMAZON.StopIntent': exitHandler,
            FriendsIntent: friendsHandler,
            RecentActivitiesIntent: recentActivitiesHandler,
            StatsIntent: statsHandler,
            SummaryIntent: summaryHandler
        },
        '/summary': {
            'AMAZON.NoIntent': menuHandler,
            'AMAZON.YesIntent': summaryHandler
        }
    };

    router.addRouter(app, config, intents, routes);

    app.messages.NO_INTENT_FOUND = 'Sorry, I didn\'t understand that.';
    app.messages.NO_LAUNCH_FUNCTION = 'Please ask me to do something!';
    app.messages.INVALID_REQUEST_TYPE = 'Sorry, I didn\'t understand that';
    app.messages.GENERIC_ERROR = 'Sorry, something went wrong. Please try saying something else.';

    // Connect to lambda
    exports.handler = app.lambda();
    exports.alexa = app;

    // Validate request
    // If initialization fails and returns false, caller should return true
    // to avoid running async executions.
    function preHandler(request, response) {
        if (!request.sessionDetails.accessToken) {
            response.linkAccount();
            response.say('Please link your account in the Alexa app.').send();
            return false;
        }
        console.log('Found valid access token.');
        console.log('intent:' + request.data.request.intent);
        return true;
    }

    function launchHandler(request, response) {
        console.log('launchHandler');
        let text = '';

        getCached(request, response, 'athlete', 'getAsync', {}, true).then(function (athlete) {
            return ' ' + athlete.firstname + ' ' + athlete.lastname;
        }).catch(function (err) {
        }).then(function (name) {
            name = name || '';
            text += `Hello ${name}. Welcome to Mountain Top. Say summary to get your summary, or, you can ask for help.`;
            console.log(text);
            response
                .say(validateText(text))
                .route('/summary')
                .send();
        });

        return false;
    }

    function menuHandler(request, response) {
        const text = [
            '<p>You can ask for:</p>',
            '<p>Summary.</p>',
            '<p>Recent activities.</p>',
            '<p>Friends activities.</p>',
            '<p>Stats.</p>'
        ].join('');
        console.log(text);
        response
            .say(validateText(text))
            .route('/')
            .send();
    }

    function exitHandler(request, response) {
        console.log('exitHandler');
        const text = 'Thanks for using Mountain Top!';
        response
            .say(validateText(text))
            .send();
    }
})();
