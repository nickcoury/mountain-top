import * as _ from 'lodash';
import { Activity } from '../types';
import { getCached, toFeet, toMiles, toDateSsml, pastTense, plural, validateText } from '../util';

export default function recentActivitiesHandler(request, response) {
    let text = '';

    getCached(request, response, 'athlete', 'listActivitiesAsync', {
        page: 0,
        per_page: 10
    }).then(function (activities: Activity[]) {
        if (activities && activities.length > 0) {
            text += `Here are your ${activities.length} most recent activities`;
            _(activities)
                .forEach(function (activity) {
                    const distance = toMiles(activity.distance);
                    const climbing = toFeet(activity.total_elevation_gain);
                    const grade = climbing / (distance * 5280);
                    const date = new Date(activity.start_date);
                    const dateString = isNaN(date.getTime()) ? '' : ` on ${toDateSsml(date)}`;
                    const summary = [
                        `You posted ${activity.name}${dateString}. `,
                        `${pastTense(activity.type)} ${plural(distance, 'mile')}`,
                        grade > 0.02 ? ` with ${+climbing.toPrecision(2)} feet of climbing. ` : '. ',
                        activity.achievement_count === 0 ? '' :
                            `You earned ${plural(activity.achievement_count, 'achievement')}`
                    ].join('');

                    text += '<p>' + summary + '</p>';
                });
        } else {
            text += '<p>No recent activities found. Upload some and check back.</p>';
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
        console.log('Recent Activity Intent Error');
        console.log(JSON.stringify(err));
        response.say('There was an error. Please try again.').send();
    });

    return false;
}
