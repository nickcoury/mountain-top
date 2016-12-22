import { Athlete } from '../types';
import { getCached, plural, toMiles, toFeet, toTimeSsml, validateText } from '../util';

export default function statsHandler(request, response) {
    console.log('statsHandler');
    let text = '';

    getCached(request, response, 'athlete', 'getAsync', {}, true).then(function (athlete: Athlete) {
        return getCached(request, response, 'athletes', 'statsAsync', {id: athlete.id});
    }).then(function (stats) {
        text += statsHelper(stats, 'recent', 'Your totals from the last four weeks:');
        text += statsHelper(stats, 'ytd', 'Your year to date totals:');
        text += statsHelper(stats, 'all', 'Your lifetime totals:');
        if (text.trim().length === 0) {
            text += '<p>No statistics found. Upload some new activities and try back soon.</p>';
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
        console.log('Stats Intent Error');
        console.log(JSON.stringify(err));
        response.say('There was an error. Please try again.').send();
    });

    return false;
}

function statsHelper(stats, category, intro) {
    const text =
        statsSubHelper(stats[category + '_ride_totals'], 'ride') +
        statsSubHelper(stats[category + '_run_totals'], 'run') +
        statsSubHelper(stats[category + '_swim_totals'], 'swim');
    return text.length > 0 ? `<p>${intro}</p>${text}` : '';
}

function statsSubHelper(totals, type) {
    if (!totals || !totals.count) return '';
    const distance = +toMiles(totals.distance).toFixed(1);

    const text = `${totals.count} ${type}s. ` +
        `${plural(distance, 'mile')} with ` +
        `${+toFeet(totals.elevation_gain).toPrecision(3)} feet of elevation gain in ${toTimeSsml(totals.moving_time)}. `;
    `${totals.achievement_count ? 'Earned ' + plural(totals.achievement_count, 'achievement') + '.' : ''}`;

    return '<p>' + text + '</p>';
}
