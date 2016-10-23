var _ = require('lodash');
var alexa = require('alexa-app');
var router = require('alexa-app-router');
var Promise = require("bluebird");
var strava = require('strava-v3');

_(strava).forEach(Promise.promisifyAll);
var app = new alexa.app('strava');
var accessToken;

var config = {
    defaultRoute: '/',
    pre: preHandler,
    launch: launchHandler
};

var intents = {
    SummaryIntent: { utterances: ['{please |}{get|give|read} {me |} my {summary|updates}'] },
    FriendsIntent: { utterances: ['{please |}{get|give|read} {me |} my {friend|friends}{ activities|}'] },
    RecentActivitiesIntent: { utterances: ['{give |what are |}{my |me my |}{recent |} activities'] }
};

var routes = {
    '/': {
        'AMAZON.HelpIntent': menuHandler,
        FriendsIntent: friendsHandler,
        RecentActivitiesIntent: recentActivitiesHandler,
        StatsIntent: statsHandler,
        SummaryIntent: summaryHandler
    },
    '/go-to-summary': {
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
    accessToken = request.sessionDetails.accessToken;
    if (!accessToken) {
        response.linkAccount();
        response.say('Please link your account in the Alexa app.').send();
        return false;
    }
    console.log('Found valid access token.');
    console.log(request.data.request.intent);
    return true;
}

function launchHandler(request, response) {
    console.log('app.launch');
    var text;

    strava.athlete.getAsync({
        access_token: accessToken
    }).then(function (athlete) {
        return ' ' + athlete.firstname + ' ' + athlete.lastname;
    }).catch(function (err) {
    }).then(function (name) {
        text += 'Hello' + (name || '') + '. Welcome to Straavalexa. Would you like your summary?';
        console.log(text);
        response
            .say(text)
            .route('/go-to-summary')
            .send();
    });

    return false;
}


function menuHandler(request, response) {
    var text = [
        '<p>Here are some things to say:</p>',
        '<p>Give me my summary.</p>',
        '<p>Give me my recent activities.</p>',
        '<p>Give me my friends activities.</p>'
    ].join('');

    console.log(text);
    response
        .say(text)
        .send();
}



function summaryHandler(request, response) {
    console.log('summaryHandler');
    var text = 'Here is your Straava summary.';

    strava.athlete.getAsync({
        access_token: accessToken
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

function recentActivitiesHandler(request, response) {
    var number = 10;
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

function friendsHandler(request, response) {
    console.log('friendsHandler');
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
        console.log('Friends Intent Error');
        console.log(JSON.stringify(err));
        response.say('There was an error. Please try again.').send();
    });

    return false;
}

function statsHandler(request, response) {

}
