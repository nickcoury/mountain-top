var lambda = require('../src/index.js');

var event = {
    "session": {
        "sessionId": "SessionId.11111111-2222-3333-4444-555555555555",
        "application": {
            "applicationId": "amzn1.echo-sdk-ams.app.11111111-2222-3333-4444-555555555555"
        },
        "attributes": {},
        "user": {
            "userId": "amzn1.ask.account.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            "accessToken": "0000000000000000000000000000000000000000"
        },
        "new": true
    },
    "request": {
        "type": "IntentRequest",
        "requestId": "EdwRequestId.dd4c61ac-eb08-40e5-980c-9869299817c9",
        "locale": "en-US",
        "timestamp": "2016-10-06T04:42:04Z",
        "intent": {
            "name": "DontKnowIntent",
            "slots": {}
        }
    },
    "version": "1.0"
};

var context = {
    name: 'context',
    fail: function () {
        console.log('Failed context');
    },
    succeed: function() {
        console.log('Succeeded context');
    }
};

lambda.handler(event,context);

