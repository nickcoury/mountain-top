(function() {
    let lambda = require('../src/index.js');
    let fs = require('fs');
    let path = require('path');

    let intent = process.argv[2];
    let configFile = fs.readFileSync(__dirname + '/../src/data/strava_config', 'utf8');
    let config = JSON.parse(configFile);


    let event = {
        "session": {
            "sessionId": "SessionId.11111111-2222-3333-4444-555555555555",
            "application": {
                "applicationId": "amzn1.echo-sdk-ams.app.11111111-2222-3333-4444-555555555555"
            },
            "attributes": {},
            "user": {
                "userId": "amzn1.ask.account.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                "accessToken": config.access_token
            },
            "new": true
        },
        "request": {
            "type": "IntentRequest",
            "requestId": "EdwRequestId.75591a21-9e75-423b-a3e6-0cb21ba680eb",
            "locale": "en-US",
            "timestamp": "2016-10-06T22:18:18Z",
            "intent": {
                "name": intent,
                "slots": {
                    "number": {
                        "name": "number"
                    }
                }
            }
        },
        "version": "1.0"
    };

    let context = {
        name: 'context',
        fail: function () {
            console.log('Failed context');
        },
        succeed: function(result) {
            console.log('Succeeded context');
        }
    };

    lambda.handler(event,context);
})();
