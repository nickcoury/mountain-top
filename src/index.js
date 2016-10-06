var strava = require('strava-v3');
var alexa = require('alexa-app');
var app = new alexa.app('strava');

console.log('Modules loaded');

app.launch(function(request,response) {
    console.log('app.launch');
    console.log(JSON.stringify(request));
    response.linkAccount();
    response.say('Welcome to the Strava app.');
});

app.intent('SummaryIntent',
    {
        slots:{'number':'NUMBER'},
        utterances:[
            '{please |}give me my summary'
        ]
    },
    function(request,response) {
        console.log('SummaryIntent');
        strava.activities.get({}, function(err, result) {
           console.log('Summary intent');
           console.log(JSON.stringify(result));
        });

        var summary = 'Here is your summary';

        response.say(summary);
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
