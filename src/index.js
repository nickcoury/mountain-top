'use strict';
var StravaSkill = require('./strava-skill');

exports.handler = function (event, context) {
    var strava = new StravaSkill();
    strava.process(event, context);
};
