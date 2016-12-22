import * as _ from 'lodash';
import { Activity } from '../types';
import { getCached, plural, toMiles, toFeet, validateText, pastTense } from '../util';

export default function friendsHandler(request, response) {
    console.log('friendsHandler');
    let text = '';

    getCached(request, response, 'activities', 'listFriendsAsync', {
        page: 0,
        per_page: 20
    }).then(function (friendActivities: Activity[]) {
        if (friendActivities && friendActivities.length > 0) {
            text += 'Found ' + friendActivities.length + ' friend activities. ';

            _(friendActivities)
                .forEach(function(activity:any) {
                    const distance = toMiles(activity.distance);
                    const climbing = toFeet(activity.total_elevation_gain);
                    const grade = climbing / (distance * 5280);

                    const tName = activity.athlete.firstname + ' ' + activity.athlete.lastname;
                    const tType = pastTense(activity.type);
                    const tDist = plural(distance, 'mile');
                    const tClimb = (grade > 0.02) ? ` with ${+climbing.toPrecision(2)} feet of climbing` : '';
                    const tAchieve = (activity.achievement_count === 0) ? '' :
                        `${activity.athlete.firstname} earned plural(activity.achievement_count, ' achievement')}`;

                    const summary = `${tName} posted ${activity.name}. ${tType} ${tDist}${tClimb}. ${tAchieve}`;

                    text += '<p>' + summary + '</p>';
                });
        } else {
            text += '<p>No friend activities found. Get them out with you and exercise!</p>';
        }

        return true;
    }).then(function () {
        text += '<p>What would you like next?</p>';
        console.log(text);
        response
            .say(validateText(text))
            .route('/')
            .send();
        console.log(response.response);
    }).catch(function (err) {
        console.log('Friends Intent Error');
        console.log(JSON.stringify(err));
        response.say('There was an error. Please try again.').send();
    });

    return false;
}
