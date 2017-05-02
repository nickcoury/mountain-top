import { getCached, validateText } from '../util';

export default function renameHandler(request, response) {
    let text = '';

    getCached(request, response, 'athlete', 'listActivitiesAsync', {
        page: 0,
        per_page: 1,
        type: request.slot('ACTIVITY_TYPE')
    }).then(function (activities) {
        if (activities && activities.length > 0) {
             return renameActivity(request, response, activities[0], request.slot('ACTIVITY_NAME'));
        }
        throw new Error('No activity found.');
    }).then(function () {
        text += `Ok. Renamed your ${request.slot('ACTIVITY_TYPE')} ${request.slot('ACTIVITY_NAME')}`;
        console.log(text);
        response
            .say(validateText(text))
            .send();
    }).catch(function (err) {
        console.log('Recent Activity Intent Error');
        console.log(JSON.stringify(err));
        response.say('There was an error. Please try again.').send();
    });

    return false;
}

function renameActivity(request, response, activity, name) {
    return getCached(request, response, 'activities', 'update', {
        id: activity.id,
        name: name
    });
}
