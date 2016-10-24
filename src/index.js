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
    SummaryIntent: { utterances: ['{get|give|read} {me |my |}{summary}'] },
    StatsIntent: { utterances: ['{get|give|read} {me |my |}{stats|statistics}'] },
    FriendsIntent: { utterances: ['{get|give|read} {me |my |}{friend|friends}{ activities|}'] },
    RecentActivitiesIntent: { utterances: ['{get|give|read} {me |my |}{recent |} activities'] }
};

var routes = {
    '/': {
        'AMAZON.HelpIntent': menuHandler,
        'AMAZON.StopIntent': exitHandler,
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
    var text = '';

    getCached(request, response, 'athlete', 'getAsync', {}, true).then(function (athlete) {
        return ' ' + athlete.firstname + ' ' + athlete.lastname;
    }).catch(function (err) {
    }).then(function (name) {
        text += 'Hello' + (name || '') + '. Welcome to Straavalexa. Say summary to get your summary, or, you can ask for help.';
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
        '<p>Give me my friends activities.</p>',
        '<p>Give me my stats.</p>'
    ].join('');

    console.log(text);
    response
        .say(text)
        .route('/')
        .send();
}

function exitHandler(request, response) {
    var text = 'Thanks for using straavalexa!';
    console.log(text);
    response
        .say(text)
        .send();
}

function summaryHandler(request, response) {
    console.log('summaryHandler');
    var text = '';
    var now = new Date(request.data.request.timestamp);
    now.setHours(now.getHours()-8);

    getCached(request, response, 'athlete', 'getAsync', {}, true).then(function (athlete) {
        return getCached(request, response, 'athlete', 'listActivitiesAsync', {
            after: getMonday(now, 1).getTime()/1000
        }, false);
    }).then(function (activities) {
        var monday = getMonday(now);
        var thisWeek = _.filter(activities, function(activity) { return new Date(activity.start_date) >= monday; });
        var lastWeek = _.filter(activities, function(activity) { return new Date(activity.start_date) < monday; });

        text += summaryHelper(thisWeek, 'this');
        text += summaryHelper(lastWeek, 'last');
        return true;
    }).then(function () {
        console.log(text);
        response
            .say(text)
            .route('/')
            .send();
    }).catch(function (err) {
        console.log('Summary Intent Error');
        console.log(JSON.stringify(err));
        response.say('There was an error. Please try again.').send();
    });

    return false;
}

function summaryHelper(activities, week) {
    if (!activities || !activities.length) return '<p>No activities found ' + week + ' week.</p>';
    var text =
        summarySubHelper(activities, 'ride') +
        summarySubHelper(activities, 'run') +
        summarySubHelper(activities, 'swim');

    return '<p>' + week + ' week\'s summary.</p>' + text;
}

function summarySubHelper(activities, type) {
    var summary = _(activities)
        .filter(function(activity) { return activity.type.toLowerCase() === type; })
        .reduce(function(summary, activity) {
            summary.count = summary.count ? summary.count + 1 : 1;
            summary.distance += activity.distance;
            summary.moving_time += activity.moving_time;
            summary.total_elevation_gain += activity.total_elevation_gain;
            summary.achievement_count += activity.achievement_count;
            return summary;
        });
    if (!summary) return '';

    var distance = toMiles(summary.distance);
    var climbing = toFeet(summary.total_elevation_gain);

    var text = summary.count + ' ' + type + 's. ';
    text += +distance.toFixed(1) + ' mile' + (+distance.toFixed(1) === 1 ? '' : 's') + ' with ' + +climbing.toPrecision(3) + ' feet of climbing in '
        + toTimeSsml(summary.moving_time) + '. ';
    text += summary.achievement_count === 0 ? '' : 'You earned ' + summary.achievement_count
        + ' achievement' + (summary.achievement_count === 1 ? '' : 's') + '. ';

    return '<p>' + text + '</p>';
}

function recentActivitiesHandler(request, response) {
    var number = 10;
    var text = '';

    getCached(request, response, 'athlete', 'listActivitiesAsync', {
            per_page: number
        }, false).then(function (activities) {
        text += 'Here are your ' + activities.length + ' most recent activities';
        _(activities)
            .forEach(function(activity) {
                var distance = toMiles(activity.distance);
                var climbing = toFeet(activity.total_elevation_gain);
                var grade = climbing / (distance * 5280);
                var date = new Date(activity.start_date);
                var dateString = isNaN(date.getTime()) ? '' : ' on <say-as interpret-as="date">????' +
                    ('00' + (date.getMonth()+1)).slice(-2) + ('00' + date.getDate()).slice(-2) + '</say-as>';
                var summary = [
                    'You posted ' + activity.name + dateString + '. ',
                    pastTense(activity.type) + ' ' + +distance.toFixed(0) + ' mile' + (+distance.toFixed(0) === 1 ? '' : 's'),
                    grade > 0.02 ? ' with ' + +climbing.toPrecision(2) + ' feet of climbing. ' : '. ',
                    activity.achievement_count === 0 ? '' : 'You earned ' + activity.achievement_count
                        + ' achievement' + (activity.achievement_count === 1 ? '' : 's') + '. '
                ].join('');

                text += '<p>' + summary + '</p>';
            });

        return true;
    }).then(function () {
        console.log(text);
        response
            .say(text)
            .route('/')
            .send();
    }).catch(function (err) {
        console.log('Recent Activity Intent Error');
        console.log(JSON.stringify(err));
        response.say('There was an error. Please try again.').send();
    });

    return false;
}

function statsHandler(request, response) {
    console.log('statsHandler');
    var text = '';

    getCached(request, response, 'athlete', 'getAsync', {}, true).then(function (athlete) {
        return getCached(request, response, 'athletes', 'statsAsync', {id: athlete.id}, false);
    }).then(function (stats) {
        text += statsHelper(stats, 'recent', 'Your totals from the last four weeks:');
        text += statsHelper(stats, 'ytd', 'Your year to date totals:');
        text += statsHelper(stats, 'all', 'Your lifetime totals:');
        return true;
    }).then(function () {
        console.log(text);
        response
            .say(text)
            .route('/')
            .send();
    }).catch(function (err) {
        console.log('Stats Intent Error');
        console.log(JSON.stringify(err));
        response.say('There was an error. Please try again.').send();
    });

    return false;
}

function statsHelper(stats, category, intro) {
    var text =
        statsSubHelper(stats[category + '_ride_totals'], 'ride') +
        statsSubHelper(stats[category + '_run_totals'], 'run') +
        statsSubHelper(stats[category + '_swim_totals'], 'swim');
    if (text.length > 0) {
        text = '<p>' + intro + '</p>' + text;
    }
    return text;
}

function statsSubHelper(totals, type) {
    var text = '';
    if (!totals || !totals.count) return text;
    var distance = +toMiles(totals.distance).toFixed(1);

    text += totals.count + ' ' + type + 's. ';
    text += distance + ' mile' + (distance == 1 ? '' : 's') + ' with ' +
        +toFeet(totals.elevation_gain).toPrecision(3) + ' feet of elevation gain in ' +
        toTimeSsml(totals.moving_time) + '. ';
    text += totals.achievement_count ? 'Earned ' + totals.achievement_count
        + ' achievement' + (totals.achievement_count === 1 ? '' : 's') + '.' : '';

    return '<p>' + text + '</p>';
}

function friendsHandler(request, response) {
    console.log('friendsHandler');
    var text = '';

    getCached(request, response, 'activities', 'listFriendsAsync', {}, false).then(function (friendActivities) {
        friendActivities = _.take(friendActivities, 20);
        text += 'Found ' + friendActivities.length + ' friend activities. ';

        _(friendActivities)
            .forEach(function(activity) {
                var distance = toMiles(activity.distance);
                var climbing = toFeet(activity.total_elevation_gain);
                var grade = climbing / (distance * 5280);
                var friendSumary = [
                    activity.athlete.firstname + ' ' + activity.athlete.lastname + ' posted ' + activity.name + '. ',
                    pastTense(activity.type) + ' ' + +distance.toFixed(0) + ' mile' + (+distance.toFixed(0) > 1 ? 's' : ''),
                    grade > 0.02 ? ' with ' + +climbing.toPrecision(2) + ' feet of climbing. ' : '. ',
                    activity.achievement_count === 0 ? '' : activity.athlete.firstname + ' earned '
                    + activity.achievement_count + ' achievement' + (activity.achievement_count === 1 ? '. ' : 's. ')
                ].join('');

                text += '<p>' + friendSumary + '</p>';
            });

        return true;
    }).then(function () {
        console.log(text);
        response
            .say(text)
            .route('/')
            .send();
    }).catch(function (err) {
        console.log('Friends Intent Error');
        console.log(JSON.stringify(err));
        response.say('There was an error. Please try again.').send();
    });

    return false;
}

function toMiles(meters) {
    return meters * 0.000621371192;
}

function toFeet(meters) {
    return meters * 3.2808399;
}

function toTime(seconds) {
    return {
        seconds: seconds % 60,
        minutes: Math.floor(seconds/60) % 60,
        hours: Math.floor(seconds/3600) % 24,
        days: Math.floor(seconds/86400)
    };
}

function toTimeSsml(seconds) {
    if (!seconds) return '0 seconds';
    var time = toTime(seconds);
    var parts = [];
    if (time.days) parts.push(time.days + ' days');
    if (time.hours) parts.push(time.hours + ' hours');
    if (time.minutes) parts.push(time.minutes + ' minutes');
    if (parts.length === 0) parts.push(time.seconds + ' seconds');
    return parts.join(' ');
}

function getMonday(now, weeksAgo) {
    var d = new Date(now.getTime());
    var day = d.getDay();
    var diff = d.getDate() - day + (day == 0 ? -6:1) - ((weeksAgo||0) * 7); // adjust when day is sunday
    var monday = new Date(d.setDate(diff));
    monday.setHours(0,0,0,0);
    return monday;
}

function getCached(request, response, category, method, args, store) {
    args = args || {};
    var keyArgs = [category, method];
    for (var arg in args) {
        keyArgs.push(arg + '=' + args[arg]);
    }
    var key = keyArgs.join(':');
    var value = request.session(key);

    if (value) {
        console.log('Cache hit for ', category, method, args);
        return Promise.resolve(value);
    } else {
        args.access_token = accessToken;
        var promise = strava[category][method](args);
        if (store) {
            promise.then(function (result) {
                response.session(key, result);
            });
        }
        return promise;
    }
}

function pastTense(type) {
    var types = {
        run: 'ran',
        ride: 'rode',
        swim: 'swam'
    };
    return types[type.toLowerCase()] || type;
}
