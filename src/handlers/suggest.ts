import * as _ from 'lodash';
import * as Promise from 'bluebird';
import { Activity, Athlete } from '../types';
import { getCached, toFeet, toMiles, toDateSsml, pastTense, plural, validateText } from '../util';

const analysisWindowDays = 56;
const longRunThreshold = .20;

export default function suggestIntent(request, response) {
    let text = '';
    let athlete: Athlete;

    let date = new Date();
    date.setDate(date.getDate() - analysisWindowDays);

    getCached(request, response, 'athlete', 'getAsync', {}, true).then(function (ath: Athlete) {
        athlete = ath;
        return Promise.all([
            getCached(request, response, 'athlete', 'listActivitiesAsync', {after: date.getTime()})
        ]);
    }).then(function (results: any[]) {
        const activities: Activity[] = results[0];

        const result = analyzeActivities(activities);

        text += `<p>You have averaged ${(result.dailyDistance * 7).toFixed(0)} miles a week over the last eight weeks.</p>`;

        if ()

        return true;
    }).then(function () {
        text += '<p>What would you like next?</p>';
        console.log(text);
        response
            .say(validateText(text))
            .route('/')
            .send();
    }).catch(function (err) {
        console.log('Suggest Activity Intent Error');
        console.log(JSON.stringify(err));
        response.say('There was an error. Please try again.').send();
    });

    return false;
}

function analyzeActivities(activities: Activity[]): suggestAnalysis {
    let result = new suggestAnalysis();
    const now = new Date();

    result.totalDistance = _(activities).map(activity => activity.distance).sum();
    result.dailyDistance = result.totalDistance / analysisWindowDays;

    result.longRun = _(activities)
        .filter(activity => activity.distance > (result.dailyDistance * 7 / longRunThreshold))
        .first();

    return result;
}

function computeFatigueAt(activity: Activity, atDistance: number, dailyDistance: number, now: Date): number {
    let fatigue = 0;
    const totalRecoveryTime = 2 * (activity.distance / dailyDistance) * 24 * 60 * 60 * 1000;
    const elapsedRecoveryTime =
        now.getTime() - (new Date(activity.start_date).getTime() + activity.elapsed_time * 1000);

    const amountRecovered = activity.distance * (elapsedRecoveryTime / totalRecoveryTime);
    const fatigueAtDistance = amountRecovered - atDistance;

    return Math.max(fatigueAtDistance, 0);
}

class suggestAnalysis {
    totalDistance: number;
    dailyDistance: number;

    longRun: Activity;

    cumulativeTrainingFatigue: number;
    cumulativeLongRunFatigue: number;
}