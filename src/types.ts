export interface Time {
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
}

// Strava
export interface Activity extends ActivitySummary {
    calories: number;
    description: string;
    gear: Object;
    segment_efforts: Object[];
    splits_metric: Object[];
    splits_standard: Object[];
    laps: Object[];
    best_efforts: Object[];
    device_name: string;
    embed_token: string;
    photos: Object;
}

export interface ActivitySummary {
    id: number;
    resource_state: number;
    external_id: string;
    upload_id: number;
    athlete: AthleteSummary;
    name: string;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    total_elevation_gain: number;
    elev_high: number;
    elev_low: number;
    type: string;
    start_date: string;
    start_date_local: string;
    timezone: string;
    start_latlng: number[];
    end_latlng:	number[];
    location_city: string;
    location_state: string;
    location_country: string;
    achievement_count: number;
    kudos_count: number;
    comment_count: number;
    athlete_count: number;
    photo_count: number;
    total_photo_count: number;
    map: Object;
    trainer: boolean;
    commute: boolean;
    manual: boolean;
    private: boolean;
    flagged: boolean;
    workout_type: WorkoutType;
    gear_id: string;
    average_speed: number;
    max_speed: number;
    average_cadence: number;
    average_temp: number;
    average_watts: number;
    max_watts: number;
    weighted_average_watts: number;
    kilojoules: number;
    device_watts: boolean;
    has_heartrate: boolean;
    average_heartrate: number;
    max_heartrate: number;
    kilocalories, number;
    suffer_score: number;
    has_kudoed: boolean;
}

export interface AthleteBase {
    id: number;
    resource_state: number;
}

export interface AthleteSummary extends AthleteBase {
    id: number;
    resource_state: number;
    firstname: string;
    lastname: string;
    profile_medium: string;
    profile: string;
    city: string;
    state: string;
    country: string;
    sex: Gender;
    friend: FriendStatus;
    follower: FriendStatus;
    premium: boolean;
    created_at: string;
    updated_at: string;
}

export interface Athlete extends AthleteSummary {
    follower_count: number;
    friend_count: number;
    mutual_friend_count: number;
    athlete_type: DefaultSport;
    date_preference: string;
    measurement_preference: Measurement;
    email: string;
    ftp: number;
    weight: number;
    clubs: Object[];
    bikes: Object[];
    shoes: Object[];
}

export type Gender = 'M' | 'F' | 'null';

export type FriendStatus = 'pending' | 'accepted' | 'blocked' | 'null';

export type Measurement = 'feet' | 'meters';

export enum DefaultSport {
    Cyclist = 0,
    Runner = 1
}

export enum WorkoutType {
    runDefault = 0,
    runRace = 1,
    runLongRun = 2,
    runWorkout = 3,
    rideDefault = 10,
    rideRace = 11,
    rideWorkout = 12
}
