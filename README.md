# Strava Alexa Skill
A [Strava](http://www.strava.com) skill for reviewing your recent activities.

## Features
This skill can:
- Connect to an athlete's Strava account.
- Read back recent activity details.

## Examples
    User: "Alexa, ask stravalexa for my summary."
    User: "Alexa, ask stravalexa for my recent activities"

## Setup
Copy `src/data/strava_config.template` to `src/data/strava_config` and fill in credentials.
Setup of Alexa skill is required, please refer to Amazon's documentation.

## Building
Use `node test/test.js <Intent Name>` to run the local test function using mock data.
Use `gulp lambda` to deploy to AWS lambda.  Must have an AWS credentials file in `(User Profile)/.aws/credentials`.
Use `node test/schema.js` and `node test/utterances.js` to generate Alexa Skills Kit schema and utterances.

## Known issues
The Windows `gulp-zip` library messes up file execution permissions, so deploying using `gulp` won't work on Windows.

## Future
I will be moving `alexa-router` to its own project soon.
I will be expanding the functionality of this project.