'use strict';
var strings = require('./strings');

var registerEventHandlers = function (eventHandlers, skillContext) {
    eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
        //if user said a one shot command that triggered an intent event,
        //it will start a new session, and then we should avoid speaking too many words.
        skillContext.needMoreHelp = false;
    };

    eventHandlers.onLaunch = function (launchRequest, session, response) {
        //Speak welcome message and ask user questions
        //based on whether there are players or not.
        var output = '', reprompt;
        output = 'Welcome to strava. What would you like to hear?';
        response.ask(speechOutput, reprompt);
    };
};
exports.register = registerEventHandlers;
