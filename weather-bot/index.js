'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const weather = require('yahoo-weather');
const app = express();
var request = require('request')
var axios = require('axios');
var urlOpener = require('openurl');

// Helpers
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

var urlencodedParser = bodyParser.urlencoded({ extended: false })

//artevelde-bot
app.post('/artevelde-bot', function(req, res) {

    var configSpotify = {
        headers: {
            'Host': 'api.spotify.com',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer BQCIk27YHx_0Mo1WIFrLKQq3MhfWgwfvt_EZ5kQSVVH8gXG0uRhWDHk57SmBXCLzNDVpExA_ftRBPScdamxv3F_8qVhszErOru25AkO0htePoieUdDrObiZEJjTRzRuRXHgDUkKAvUvEcCbDJqvpvfMyOUCnnofRDFPx2cP_vpP_XaqlZhhqbME6MTu96ShtVupU06dYaqRoiXtM4ru4BNjB-6zHOqysTRrNUtUJitklGyjE2tWjV_ahMpxjmC4fTqlwNw'
        }
    };

    if (req.body.result && req.body.result.parameters && req.body.result.parameters.artist) {
        
        var artist = req.body.result.parameters.artist.trim();

        axios.get('https://api.spotify.com/v1/search?q=' + artist + '&type=artist', configSpotify)
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
        axios.get('https://api.spotify.com/v1/search?q=' + album + '&type=album', configSpotify)
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
        axios.get('https://api.spotify.com/v1/search?q=' + track + '&type=track', configSpotify)
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
        axios.get('https://api.spotify.com/v1/search?q=' + playlist + '&type=playlist', configSpotify)
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
                        "callback_id": response.data.playlists.items[0].uri,
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
                        "actions": [
                            {
                                "name": "Afspelen",
                                "text": "Afspelen",
                                "type": "button",
                                "value": response.data.playlists.items[0].uri
                            }
                        ],
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
    else if (req.body.result && req.body.result.parameters && req.body.result.parameters.geoCity) {
        var city = req.body.result.parameters.geoCity.trim();
        weather(city).then(response => { 
            var slack_message = {
                "text": 'Het weer voor de stad: ' + city + '.',
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


function sendMessageToSlackResponseURL(responseURL, JSONmessage){
    var postOptions = {
        uri: responseURL,
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        json: JSONmessage,
    }
    request(postOptions, (error, response, body) => {
        if (error){
            // handle errors as you see fit
        }
    })
}
// Actions
app.post('/actions', urlencodedParser, (req, res) =>{
    res.status(200).end() // best practice to respond with 200 status
    var actionJSONPayload = JSON.parse(req.body.payload) // parse URL-encoded payload JSON string

    if (actionJSONPayload.actions[0].name === "Afspelen") {
        var message = {
            "text": actionJSONPayload.user.name + " heeft op " + actionJSONPayload.actions[0].name + " gedrukt.",
            "replace_original": false
        }
    }
    else {
        var message = {
            "text": "Er liep iets verkeerd.",
            "replace_original": false
        }
    }
    sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
})

// // WeatherBot
// app.post('/weather-bot', function(req, res) {
//     var city = req.body.result &&
//                 req.body.result.parameters &&
//                 req.body.result.parameters.geoCity ? 
//                 req.body.result.parameters.geoCity.trim() : 
//                 "Seems like some problem. Speak again.";
//     weather(city).then(response => { 
//         var slack_message = {
//             "text": 'The temperature in ' + city + '. Please give me another city!',
//             "attachments": [{
//                 "color": "#366abc",
//                 "fields": [{
//                     "title": "Temperature",
//                     "value": response.item.condition.temp + ' °C',
//                     "short": "false"
//                 }],
//             }],
//         }
//         return res.json({
//             speech: "speech",
//             displayText: "speech",
//             source: 'weather-bot',
//             data: {
//                 "slack": slack_message,
//             }
//         });
//     }).catch(err => {
//         console.log('ERROR Yahoo weather is broken!!');
//     });

// });


app.listen((process.env.PORT || 8000), function() {
    console.log("Server up and listening");
});



// RESPONSE BUTTONS
// {
// 	"speech": {
// 		"type": "interactive_message",
// 		"actions": [{
// 			"name": "play",
// 			"type": "button",
// 			"value": "play"
// 		}],
// 		"callback_id": "playlist",
// 		"team": {
// 			"id": "T7P1W5S68",
// 			"domain": "nmd-bots"
// 		},
// 		"channel": {
// 			"id": "D7W4BDXUK",
// 			"name": "directmessage"
// 		},
// 		"user": {
// 			"id": "U7NEHUNU9",
// 			"name": "nielcapp1"
// 		},
// 		"action_ts": "1511431470.196854",
// 		"message_ts": "1511431468.000079",
// 		"attachment_id": "1",
// 		"token": "C4O9XcrLHY70vtw8el3m96Bd",
// 		"is_app_unfurl": false,
// 		"original_message": {
// 			"text": "Resultaat voor de playlist: Studio Brussel Switch",
// 			"username": "WeatherBot",
// 			"bot_id": "B7VLS7NCR",
// 			"attachments": [{
// 				"callback_id": "playlist",
// 				"id": 1,
// 				"thumb_height": 300,
// 				"thumb_width": 300,
// 				"thumb_url": "https://pl.scdn.co/images/pl/default/20a1bca8e947b583b0d4d0afe0e8f46da6073510",
// 				"color": "366abc",
// 				"fields": [{
// 						"title": "Afspeellijst",
// 						"value": "Studio Brussel: Switch",
// 						"short": true
// 					},
// 					{
// 						"title": "Eigenaar afspeellijst",
// 						"value": "Studio Brussel",
// 						"short": true
// 					}
// 				],
// 				"actions": [{
// 					"id": "1",
// 					"name": "play",
// 					"text": "Afspelen",
// 					"type": "button",
// 					"value": "play",
// 					"style": ""
// 				}],
// 				"fallback": "[no preview available]"
// 			}],
// 			"type": "message",
// 			"subtype": "bot_message",
// 			"ts": "1511431468.000079"
// 		},
// 		"response_url": "https://hooks.slack.com/actions/T7P1W5S68/276176851569/FK6euqIRIPO9oSbuaZb4WTGl",
// 		"trigger_id": "277769496679.261064196212.bf9e6095bdb11561af0f1e6ee80e0250"
// 	},
// 	"displayText": {
// 		"type": "interactive_message",
// 		"actions": [{
// 			"name": "play",
// 			"type": "button",
// 			"value": "play"
// 		}],
// 		"callback_id": "playlist",
// 		"team": {
// 			"id": "T7P1W5S68",
// 			"domain": "nmd-bots"
// 		},
// 		"channel": {
// 			"id": "D7W4BDXUK",
// 			"name": "directmessage"
// 		},
// 		"user": {
// 			"id": "U7NEHUNU9",
// 			"name": "nielcapp1"
// 		},
// 		"action_ts": "1511431470.196854",
// 		"message_ts": "1511431468.000079",
// 		"attachment_id": "1",
// 		"token": "C4O9XcrLHY70vtw8el3m96Bd",
// 		"is_app_unfurl": false,
// 		"original_message": {
// 			"text": "Resultaat voor de playlist: Studio Brussel Switch",
// 			"username": "WeatherBot",
// 			"bot_id": "B7VLS7NCR",
// 			"attachments": [{
// 				"callback_id": "playlist",
// 				"id": 1,
// 				"thumb_height": 300,
// 				"thumb_width": 300,
// 				"thumb_url": "https://pl.scdn.co/images/pl/default/20a1bca8e947b583b0d4d0afe0e8f46da6073510",
// 				"color": "366abc",
// 				"fields": [{
// 						"title": "Afspeellijst",
// 						"value": "Studio Brussel: Switch",
// 						"short": true
// 					},
// 					{
// 						"title": "Eigenaar afspeellijst",
// 						"value": "Studio Brussel",
// 						"short": true
// 					}
// 				],
// 				"actions": [{
// 					"id": "1",
// 					"name": "play",
// 					"text": "Afspelen",
// 					"type": "button",
// 					"value": "play",
// 					"style": ""
// 				}],
// 				"fallback": "[no preview available]"
// 			}],
// 			"type": "message",
// 			"subtype": "bot_message",
// 			"ts": "1511431468.000079"
// 		},
// 		"response_url": "https://hooks.slack.com/actions/T7P1W5S68/276176851569/FK6euqIRIPO9oSbuaZb4WTGl",
// 		"trigger_id": "277769496679.261064196212.bf9e6095bdb11561af0f1e6ee80e0250"
// 	},
// 	"source": "weather-bot-wot"
// }