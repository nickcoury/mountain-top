var _ = require('lodash');
var alexa = require('alexa-app');
var alexaRouter = require('./alexa-router');
var Promise = require("bluebird");
var strava = require('strava-v3');

_(strava).forEach(Promise.promisifyAll);
var app = new alexa.app('strava');
var accessToken;

app = alexaRouter.addRouter(app);

console.log('Modules loaded');

app.routes({
    '/': {
        'AMAZON.HelpIntent': menuHandler,
        RecentActivitiesIntent: recentActivitiesHandler,
        StatsIntent: statsHandler,
        SummaryIntent: summaryHandler
    },
    '/athletes/me': {},
    '/athletes': {},
    '/summary': {
        'AMAZON.NoIntent': menuHandler,
        'AMAZON.YesIntent': summaryHandler
    }
}, {
    defaultRoute: '/'
});

// Validate request
// If initialization fails and returns false, caller should return true
// to avoid running async executions.
app.pre = function(request, response) {
    accessToken = request.sessionDetails.accessToken;
    if (!accessToken) {
        response.linkAccount();
        response.say('Please link your account in the Alexa app.').send();
        return false;
    }
    console.log('Found valid access token.');
    console.log(request.data.request.intent);
    return true;
};

app.launch(function(request,response) {
    console.log('app.launch');

    strava.athlete.getAsync({
        access_token: accessToken
    }).then(function (athlete) {
        return ' ' + athlete.firstname + ' ' + athlete.lastname;
    }).catch(function (err) {
    }).then(function (name) {
        response
            .say('Hello' + (name || '') + '. Welcome to Straavalexa. Would you like your summary?')
            .route('/summary')
            .send();
    });

    return false;
});

app.intent('AMAZON.HelpIntent',
    function(request, response) {
        console.log('SummaryIntent Default Handler');
    }
);

app.intent('AMAZON.NoIntent',
    function(request, response) {
        console.log('SummaryIntent Default Handler');
    }
);

app.intent('AMAZON.YesIntent',
    function(request, response) {
        console.log('SummaryIntent Default Handler');
    }
);

app.intent('SummaryIntent',
    {
        slots:{},
        utterances:[
            '{please |}{get|give|read} {me |} my {summary|updates}'
        ]
    },
    function(request, response) {
        console.log('SummaryIntent Default Handler');
        console.log(request);
    }
);

app.intent('RecentActivitiesIntent',
    {
        slots: {},
        utterances: [
            '{give |what are |}{my |me my |}{recent |} activities'
        ]
    },
    function(request,response) {
        console.log('RecentActivitiesIntent');
        console.log(request);
    }
);

app.messages.NO_INTENT_FOUND = 'Sorry, I didn\'t understand that.';
app.messages.NO_LAUNCH_FUNCTION = 'Please ask me to do something!';
app.messages.INVALID_REQUEST_TYPE = 'Sorry, I didn\'t understand that';
app.messages.GENERIC_ERROR = 'Sorry, something went wrong. Please try saying something else.';

// Connect to lambda
exports.handler = app.lambda();
exports.alexa = app;


function menuHandler(request, response) {
    var text = [
        '<p>Here are some things to say:</p>',
        '<p>Give me my summary.</p>',
        '<p>Give me my recent activities.</p>'
    ].join('');

    response
        .say(text)
        .route('/')
        .send();
}
function recentActivitiesHandler(request, response) {
    var number = request.slot('number') || 10;
    var text = '';

    strava.athlete.getAsync({
        access_token: accessToken
    }).then(function (athlete) {
        return strava.athlete.listActivitiesAsync({
            access_token: accessToken,
            per_page: number
        });
    }).then(function (activities) {
        text += 'Here are your ' + activities.length + ' most recent activities';
        _(activities)
            .forEach(function(activity) {
                var distance = activity.distance * 0.000621371192;
                var climbing = activity.total_elevation_gain * 3.2808399;
                var grade = climbing / (distance * 5280);
                var date = new Date(activity.start_date);
                var dateString = isNaN(date.getTime()) ? '' : ' on <say-as interpret-as="date">????' +
                    ('00' + date.getMonth()).slice(-2) + ('00' + date.getDate()).slice(-2) + '</say-as>';
                var summary = [
                    'You posted ' + activity.name + dateString + '. ',
                    activity.type + ' of ' + +distance.toFixed(0) + ' miles',
                    grade > 0.02 ? ' with ' + +climbing.toPrecision(2) + ' feet of climbing. ' : '. ',
                    activity.achievement_count === 0 ? '' : 'You earned ' + activity.achievement_count + ' achievements. '
                ].join('');

                text += '<p>' + summary + '</p>';
            });

        return true;
    }).then(function () {
        response.say(text).send();
    }).catch(function (err) {
        console.log('Recent Activity Intent Error');
        console.log(JSON.stringify(err));
        response.say('There was an error. Please try again.').send();
    });

    return false;
}

function summaryHandler(request, response) {
    console.log('summaryHandler');
    var text = '';

    strava.athlete.getAsync({
        access_token: accessToken
    }).then(function (athlete) {
        return strava.activities.listFriendsAsync({access_token: accessToken});
    }).then(function (friendActivities) {
        text += 'Found ' + friendActivities.length + ' friend activities. ';

        _(friendActivities)
            .take(20)
            .forEach(function(activity) {
                var distance = activity.distance * 0.000621371192;
                var climbing = activity.total_elevation_gain * 3.2808399;
                var grade = climbing / (distance * 5280);
                var friendSumary = [
                    activity.athlete.firstname + ' ' + activity.athlete.lastname + ' posted ' + activity.name + '. ',
                    activity.type + ' of ' + +distance.toFixed(0) + ' miles',
                    grade > 0.02 ? ' with ' + +climbing.toPrecision(2) + ' feet of climbing. ' : '. ',
                    activity.achievement_count === 0 ? '' : activity.athlete.firstname + ' earned ' + activity.achievement_count + ' achievements. '
                ].join('');

                text += '<p>' + friendSumary + '</p>';
            });

        return true;
    }).then(function () {
        console.log(text);
        response.say(text).send();
    }).catch(function (err) {
        console.log('Summary Intent Error');
        console.log(JSON.stringify(err));
        response.say('There was an error. Please try again.').send();
    });

    return false;
}

function statsHandler(request, response) {

}
