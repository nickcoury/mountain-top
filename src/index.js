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

app.routes([
    {
        path: '/summary',
        intents: {
            SummaryIntent: summaryHandlerSummaryIntent
        }
    },
    {
        path: '/athletes/me'
    },
    {
        path: '/athletes'
    }
], {
    before: init,
    after: null
});

// Validate request
// If initialization fails and returns false, caller should return true
// to avoid running async executions.
function init(request, response) {
    accessToken = request.sessionDetails.accessToken;
    if (!accessToken) {
        response.linkAccount();
        response.say('Please link your account in the Alexa app.').say();
        return false;
    }
    return true;
}

app.launch(function(request,response) {
    console.log('app.launch');
    if (!init(request)) return true;

    response.say('Welcome to the Stravalexa app.').say();
});

app.intent('SummaryIntent',
    {
        slots:{'number':'NUMBER'},
        utterances:[
            '{please |}give me my summary'
        ]
    },
    function(request, response) {
        if (!init(request)) return true;

        console.log('SummaryIntent');
        var text = '';

        strava.athlete.getAsync({
            access_token: accessToken
        }).then(function (athlete) {
            text += 'Welcome ' + athlete.firstname + ' ' + athlete.lastname + '. Here is your Straava summary. ';

            return strava.activities.listFriendsAsync({access_token: accessToken});
        }).then(function (friendActivities) {
            text += 'Found ' + friendActivities.length + ' friend activities. ';

            _(friendActivities)
                .take(20)
                .forEach(function(activity) {
               var friendSumary = [
                   activity.athlete.firstname + ' ' + activity.athlete.lastname + ' posted ' + activity.name + '. ',
                   activity.type + ' of ' + Math.round(activity.distance * 0.000621371192, 2) + ' miles with ',
                   Math.round(activity.total_elevation_gain * 3.2808399, 0)  + ' feet of elevation gain. ',
                   activity.achievement_count === 0 ? '' : activity.athlete.firstname + ' earned ' + activity.achievement_count + ' achievements. '
               ].join('');

               text += friendSumary;
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
);

app.intent('RecentActivities',
    {
        slots: {'number':'NUMBER'},
        utterances: [
            '{give |what are |}{my |me my |}{recent |}{1-100|number} activities'
        ]
    },
    function(request,response) {
        console.log('RecentActivities');
        var number = request.slot('number');
        response.say('You asked for ' + number + ' recent activities');
    }
);

// Connect to lambda
exports.handler = app.lambda();
exports.alexa = app;

function summaryHandlerSummaryIntent(args, vars) {

}

/*

 {
 "intent": "DontKnowIntent"
 },
 {
 "intent": "AMAZON.StartOverIntent"
 },
 {
 "intent": "AMAZON.RepeatIntent"
 },
 {
 "intent": "AMAZON.HelpIntent"
 },
 {
 "intent": "AMAZON.YesIntent"
 },
 {
 "intent": "AMAZON.NoIntent"
 },
 {
 "intent": "AMAZON.StopIntent"
 },
 {
 "intent": "AMAZON.CancelIntent"
 }


 DontKnowIntent i don't know

 DontKnowIntent don't know

 DontKnowIntent skip

 DontKnowIntent i don't know that

 DontKnowIntent who knows

 DontKnowIntent i don't know this question

 DontKnowIntent i don't know that one

 DontKnowIntent dunno
 */
