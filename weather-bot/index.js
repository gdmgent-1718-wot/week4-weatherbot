'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const weather = require('yahoo-weather');
const app = express();
var axios = require('axios');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());



 
//MusicBot
app.post('/music-bot', function(req, res) {

    var config = {
        headers: {
            'Host': 'api.spotify.com',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer BQDypKOkw32MbfjyZfq-T_w5S1ZS7nBJYY96RsVm_sDlTL4k3QHHQov39M6r_Z6qYPX8eKze-64TK3Fh6hrmDrKfRYRZ_-hRhP-3ndfLEEl7yVc5nTylf0o5Cp-Qz2_4triHmhTwV6e-r1TQsi0T6Uito4h-TpFI9o7a-pRz0kNH3pix18fRVs5pIiaP38Aq8vWI5gAcc191GC4YxfHh76hntriGVcwGD7EYr_ly_HLqZo-0zZEaMNIpCXNDqHGVklilqw'
        }
    };

    if (req.body.result && req.body.result.parameters && req.body.result.parameters.artist) {
        
        var artist = req.body.result.parameters.artist.trim();

        axios.get('https://api.spotify.com/v1/search?q=' + artist + '&type=artist', config)
        .then(response => { 
            if (response.data.artists.total === 0) {
                var slack_message = {
                    "text": "Geen resultaten",
                }
            }
            else {
                var slack_message = {
                    "text": "Geen resultaten voor de artiest: " + artist,
                    "attachments": [{
                        "color": "#366abc",
                        "fields": [{
                            "title": "Artiest",
                            "value": response.data.artists.items[0].name,
                            "short": "false"
                        }],
                        "thumb_url": response.data.artists.items[0].images[0].url,
                    }]
                }
            }
            return res.json({
                speech: "speech",
                displayText: "speech",
                source: 'weather-bot',
                data: {
                    "slack": slack_message,
                }
            });
        })
        .catch(error => {
            console.log(error);
        });
    }
    else if (req.body.result && req.body.result.parameters && req.body.result.parameters.album) {
        var album = req.body.result.parameters.album.trim();
        axios.get('https://api.spotify.com/v1/search?q=' + album + '&type=album', config)
        .then(response => {
            if (response.data.albums.total === 0) {
                var slack_message = {
                    "text": "Geen resultaten voor het album: " + album,
                }
            }
            else {
                var slack_message = {
                    "text": "Resultaat voor het album: " + album,
                    "attachments": [{
                        "color": "#366abc",
                        "fields": [{
                            "title": "Album",
                            "value": response.data.albums.items[0].name,
                            "short": "false"
                        },{
                            "title": "Artiest",
                            "value": response.data.albums.items[0].artists[0].name,
                            "short": "false"
                        }],
                        "thumb_url": response.data.albums.items[0].images[0].url,
                    }]
                }
            }
            return res.json({
                speech: "speech",
                displayText: "speech",
                source: 'weather-bot',
                data: {
                    "slack": slack_message,
                }
            });
        })
        .catch(error => {
            console.log(error);
        });
    }
    else if (req.body.result && req.body.result.parameters && req.body.result.parameters.track) {
        var track = req.body.result.parameters.track.trim();
        axios.get('https://api.spotify.com/v1/search?q=' + track + '&type=track', config)
        .then(response => {
            if (response.data.tracks.total === 0) {
                var slack_message = {
                    "text": "Geen resultaten voor het nummer: " + track,
                }
            }
            else {
                var slack_message = {
                    "text": "Resultaat voor het nummer: " + track,
                    "attachments": [{
                        "color": "#366abc",
                        "fields": [{
                            "title": "Artiest",
                            "value": response.data.tracks.items[0].artists[0].name,
                            "short": "false"
                        },
                        {
                            "title": "Album",
                            "value": response.data.tracks.items[0].album.name,
                            "short": "false"
                        },
                        {
                            "title": "Nummer",
                            "value": response.data.tracks.items[0].name,
                            "short": "false"
                        },
                        {
                            "title": "Albumnummer",
                            "value": response.data.tracks.items[0].track_number,
                            "short": "false"
                        }],
                        "thumb_url": response.data.tracks.items[0].album.images[0].url,
                    }]
                }
            }
            return res.json({
                speech: "speech",
                displayText: "speech",
                source: 'weather-bot',
                data: {
                    "slack": slack_message,
                }
            });
        })
        .catch(error => {
            console.log(error);
        });
    }
    else if (req.body.result && req.body.result.parameters && req.body.result.parameters.playlist) {
        var playlist = req.body.result.parameters.playlist.trim();
        axios.get('https://api.spotify.com/v1/search?q=' + playlist + '&type=playlist', config)
        .then(response => {
            if (response.data.playlists.total === 0) {
                var slack_message = {
                    "text": "Geen resultaten voor de playlist: " + playlist,
                }
            }
            else {
                var slack_message = {
                    "text": "Resultaat voor de playlist: " + playlist,
                    "attachments": [{
                        "color": "#366abc",
                        "fields": [{
                            "title": "Afspeellijst",
                            "value": response.data.playlists.items[0].name,
                            "short": "false"
                        },
                        {
                            "title": "Eigenaar afspeellijst",
                            "value": response.data.playlists.items[0].owner.display_name,
                            "short": "false"
                        }],
                        "thumb_url": response.data.playlists.items[0].images[0].url,
                    }]
                }
            }
            return res.json({
                speech: "speech",
                displayText: "speech",
                source: 'weather-bot',
                data: {
                    "slack": slack_message,
                }
            });
        })
        .catch(error => {
            console.log(error);
        });
    }
    else  {
        var slack_message = {
            "text": "U heeft geen geldig commando ingegeven. Hieronder vind je de geldige commando's. Succes!",
            "attachments": [{
                "color": "#366abc",
                "fields": [{
                    "title": "Nummer opzoeken via spotify:",
                    "value": "Nummer: <nummer>",
                    "short": "false"
                },
                {
                    "title": "Album opzoeken via spotify:",
                    "value": "Album: <album>",
                    "short": "false"
                },
                {
                    "title": "Artiest opzoeken via spotify:",
                    "value": "Artiest: <artiest>",
                    "short": "false"
                },
                {
                    "title": "Afspeellijst opzoeken via spotify:",
                    "value": "Afspeellijst: <afspeellijst>",
                    "short": "false"
                },
                {
                    "title": "Het weer opzoeken voor een bepaalde stad:",
                    "value": "Het weer voor: <stad>",
                    "short": "false"
                }],
            }]
        }
        return res.json({
            speech: "speech",
            displayText: "speech",
            source: 'weather-bot',
            data: {
                "slack": slack_message,
            }
        });
    }
});


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


