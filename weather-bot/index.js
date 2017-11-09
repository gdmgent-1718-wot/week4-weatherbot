'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const weather = require('yahoo-weather');
const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// WeatherBot
app.post('/weather-bot', function(req, res) {
    var city = req.body.result &&
                req.body.result.parameters &&
                req.body.result.parameters.geoCity ? 
                req.body.result.parameters.geoCity.trim() : 
                "Seems like some problem. Speak again.";
    weather(city).then(response => { 
        var slack_message = {
            "text": 'The temperature in ' + city + '. Please give me another city!',
            "attachments": [{
                "color": "#366abc",
                "fields": [{
                    "title": "Temperature",
                    "value": response.item.condition.temp + ' °C',
                    "short": "false"
                }],
            }],
        }
        return res.json({
            speech: "speech",
            displayText: "speech",
            source: 'weather-bot',
            data: {
                "slack": slack_message,
            }
        });
    }).catch(err => {
        console.log('ERROR Yahoo weather is broken!!');
    });

});


// EchoBot
app.post('/echo', function(req, res) {
    var speech = req.body.result &&
                 req.body.result.parameters &&
                 req.body.result.parameters.echoText ? 
                 req.body.result.parameters.echoText : 
                 "Seems like some problem. Speak again.";
    return res.json({
        speech: speech,
        displayText: speech,
        source: 'weather-bot-wot'
    });
});

app.listen((process.env.PORT || 8000), function() {
    console.log("Server up and listening");
});


