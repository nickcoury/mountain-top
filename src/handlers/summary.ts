import * as _ from 'lodash';
import { Activity, Athlete } from '../types';
import { getCached, getMonday, plural, toMiles, toFeet, toTimeSsml, validateText } from '../util';

export default function summaryHandler(request, response) {
    console.log('summaryHandler');
    let text = '';
    const now = new Date(request.data.request.timestamp);
    now.setHours(now.getHours()-8);

    getCached(request, response, 'athlete', 'getAsync', {}, true).then(function (athlete: Athlete) {
        return getCached(request, response, 'athlete', 'listActivitiesAsync', {
            after: getMonday(now, 1).getTime()/1000
        });
    }).then(function (activities: Activity[]) {
        const monday = getMonday(now);
        const thisWeek = _.filter(activities, function(activity:any) { return new Date(activity.start_date) >= monday; });
        const lastWeek = _.filter(activities, function(activity:any) { return new Date(activity.start_date) < monday; });

        text += summaryHelper(thisWeek, 'This');
        text += summaryHelper(lastWeek, 'Last');
        if (thisWeek.length + lastWeek.length === 0) {
            text += '<p>Upload some activities and come back soon!</p>'
        }
        return true;
    }).then(function () {
        text += '<p>What would you like next?</p>';
        console.log(text);
        response
            .say(validateText(text))
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
    const text =
        summarySubHelper(activities, 'ride') +
        summarySubHelper(activities, 'run') +
        summarySubHelper(activities, 'swim');

    return '<p>' + week + ' week\'s summary.</p>' + text;
}

function summarySubHelper(activities, type) {
    const summary = _(activities)
        .filter(function(activity) { return activity.type.toLowerCase() === type; })
        .reduce(function(summary:any, activity) {
            summary.count = summary.count ? summary.count + 1 : 1;
            summary.distance += activity.distance;
            summary.moving_time += activity.moving_time;
            summary.total_elevation_gain += activity.total_elevation_gain;
            summary.achievement_count += activity.achievement_count;
            return summary;
        });
    if (!summary) return '';

    const distance = toMiles(summary.distance);
    const climbing = +toFeet(summary.total_elevation_gain).toPrecision(3);

    const text = `${summary.count} ${type}s. ` +
        `${plural(distance, 'mile')} with ${climbing} feet of climbing in ${toTimeSsml(summary.moving_time)}. ` +
        `${summary.achievement_count ? `You earned ${plural(summary.achievement_count, 'achievement')}` : ''}`;

    return `<p>${text}</p>`;
}
