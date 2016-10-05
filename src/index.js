var alexa = require('alexa-app');
var app = new alexa.app('strava');

app.launch(function(request,response) {
    response.linkAccount();
    response.say('Welcome to the Strava app. Please link your account');
});

app.intent('recent',
    {
        'slots':{'number':'NUMBER'}
        ,'utterances':[ 'how many recent activities {1-100|number}' ]
    },
    function(request,response) {
        var number = request.slot('number');
        response.say('You asked for '+number+' recent activities');
    }
);

// Connect to lambda
exports.handler = app.lambda();