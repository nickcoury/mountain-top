import * as Promise from 'bluebird';
import * as strava from 'strava-v3';
import { Time } from './types';

export function toMiles(meters): number {
    return meters * 0.000621371192;
}

export function toFeet(meters): number {
    return meters * 3.2808399;
}

export function toTime(seconds:number): Time {
    return {
        seconds: seconds % 60,
        minutes: Math.floor(seconds/60) % 60,
        hours: Math.floor(seconds/3600) % 24,
        days: Math.floor(seconds/86400)
    };
}

export function toTimeSsml(seconds:number) {
    if (!seconds) return '0 seconds';
    const time = toTime(seconds);
    const parts = [];
    if (time.days) parts.push(time.days + ' days');
    if (time.hours) parts.push(time.hours + ' hours');
    if (time.minutes) parts.push(time.minutes + ' minutes');
    if (parts.length === 0) parts.push(time.seconds + ' seconds');
    return parts.join(' ');
}

export function toDateSsml(date:Date) {
    return `<say-as interpret-as="date">????'${('00' + (date.getMonth() + 1)).slice(-2)}` +
        `${('00' + date.getDate()).slice(-2)}</say-as>`;
}

export function getMonday(now:Date, weeksAgo?:number) {
    const d = new Date(now.getTime());
    const day = d.getDay();
    const diff = d.getDate() - day + (day == 0 ? -6:1) - ((weeksAgo||0) * 7); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0,0,0,0);
    return monday;
}

export function pastTense(type) {
    const types = {
        run: 'ran',
        ride: 'rode',
        swim: 'swam'
    };
    return types[type.toLowerCase()] || type;
}

export function plural(number:number, unit:string, precision:number = 0) {
    const rounded = +number.toFixed(precision);
    return `${rounded} ${unit}${rounded === 1 ? '' : 's'}`;
}

export function validateText(text) {
    text = text.replace(/[^\w\s@/<>.,-="']/gi, '');
    return text;
}

export function getCached(request:any, response:any, category:string, method:string, args?:any, store?:boolean): any {
    args = args || {};
    const keyArgs = [category, method];
    for (let arg in args) {
        keyArgs.push(arg + '=' + args[arg]);
    }
    const key = keyArgs.join(':');
    const value = request.session(key);

    if (value) {
        console.log('Cache hit for ', category, method, args);
        return Promise.resolve(value);
    } else {
        args.access_token = request.sessionDetails.accessToken;
        const promise = strava[category][method](args);
        if (store) {
            promise.then(function (result) {
                response.session(key, result);
            });
        }
        return promise;
    }
}
