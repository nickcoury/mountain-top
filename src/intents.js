'use strict';
var strings = require('./strings');

var registerIntentHandlers = function (intentHandlers, skillContext) {
    intentHandlers.RecentActivitiesIntent = function (intent, session, response) {
        var output = "These are your recent activities.";
        // if (intent.slots.Date) getActivities(intent.slots.Date)
        if (skillContext.needMoreHelp) {
            output += ' You can ask for more activities or exit.';
            var reprompt = 'You can ask for more activities or exit.';
            response.ask(output, reprompt);
        } else {
            response.tell(output);
        }
    };

    intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {
        var output = strings.help;
        if (skillContext.needMoreHelp) {
            response.ask(output + ' What would you like to do?', 'What would you like to do?');
        } else {
            response.tell(output);
        }
    };

    intentHandlers['AMAZON.CancelIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.tell('No problem.');
        } else {
            response.tell('');
        }
    };

    intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {
        if (skillContext.needMoreHelp) {
            response.tell('Talk to you soon, I\'ll be here when you get your next KOM.');
        } else {
            response.tell('');
        }
    };
};
exports.register = registerIntentHandlers;
