'use strict';
var AlexaSkill = require('./alexa-skil'),
    eventHandlers = require('./event-handlers'),
    intentHandlers = require('./intents');

var APP_ID = undefined;//replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";
var skillContext = {};

var StravaSkill = function () {
    AlexaSkill.call(this, APP_ID);
    skillContext.needMoreHelp = true;
};


// Extend AlexaSkill
StravaSkill.prototype = Object.create(AlexaSkill.prototype);
StravaSkill.prototype.constructor = StravaSkill;

eventHandlers.register(StravaSkill.prototype.eventHandlers, skillContext);
intentHandlers.register(StravaSkill.prototype.intentHandlers, skillContext);

module.exports = StravaSkill;

