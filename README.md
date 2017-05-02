# Mountain Top for Strava
An unofficial [Strava](http://www.strava.com) skill for reviewing your Strava account through Amazon Alexa.

## Features
This skill can:
- Connect to an athlete's Strava account.
- Read back recent activity details.

## Examples
    User: "Alexa, ask mountain top for my summary."
    User: "Alexa, ask mountain top for my recent activities"

## Setup
Copy `src/data/strava_config.template` to `src/data/strava_config` and fill in credentials.
Setup of Alexa skill is required, please refer to Amazon's documentation.

## Building
Use `node test/test.js <Intent Name>` to run the local test function using mock data.
Use `gulp lambda` to deploy to AWS lambda.  Must have an AWS credentials file in `(User Profile)/.aws/credentials`.
Use `node util/schema.js` and `node util/utterances.js` to generate Alexa Skills Kit schema and utterances.

## Future
I will be expanding the functionality of this project.