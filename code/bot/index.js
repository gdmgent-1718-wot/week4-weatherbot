'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const weather = require('yahoo-weather');
const app = express();
var qs = require('qs');
var request = require('request')
var axios = require('axios');
const debug = require('debug');
const firebase = require('firebase')

// Helpers
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


var urlencodedParser = bodyParser.urlencoded({ extended: false })

var directionsApiKey = 'AIzaSyDKlDbASLl0MSiEfcDtCAFFZhMe_CxZ9hE';

const config = {
	apiKey: "AIzaSyDLSIo2nzvZF49pLQT4XjiDfo2K4Yk41bo",
	authDomain: "bot-agency-dashboard.firebaseapp.com",
	databaseURL: "https://bot-agency-dashboard.firebaseio.com/"
};

firebase.initializeApp(config);

const database = firebase.database();

// Action messages
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
            console.error(error);
        }
    })
}




// Slash-command: /traffic
app.post('/traffic', (req, res) => { 

    // Save Trigger Id
    let trigger_id = req.body.trigger_id; 

    // Create Dialog
    const dialog = {
        token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
        trigger_id,
        dialog: JSON.stringify({
            title: 'Traffic',
            callback_id: 'traffic-search',
            submit_label: 'Zoek',
            elements: [
                {
                    label: 'Eindbestemming',
                    type: 'text',
                    name: 'trafficEndplace',
                    value: '',
                    hint: 'Voeg hier de eindbestemming in.',
                },
                {
                    label: 'Vervoersmiddel',
                    type: 'select',
                    name: 'trafficMode',
                    placeholder: 'Vervoersmiddel',
                    options: [
                        { label: 'Auto', value: 'driving' },
                        { label: 'Te voet', value: 'walking' },
                        { label: 'Fiets', value: 'bicycling' },
                        { label: 'Openbaar vervoer', value: 'transit' }
                    ],
                    hint: 'Kies de manier waarop u zich zal verplaatsen.',
                },
            ],
        })
    }

    // Post Message
    axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
    .then((result) => {
        debug('dialog.open: %o', result.data);
        console.log(result);
        res.send('');
    }).catch((err) => {
        debug('dialog.open call failed: %o', err);
        res.sendStatus(500);
    });

    // Finish The Callback
    res.end();
});

// Slash-command: /spotify
app.post('/spotify', (req, res) => { 
    
    // Save Trigger Id
    let trigger_id = req.body.trigger_id; 

    // Go To The Firebase Database
    database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {
        
        // Get Access Token
        var spotifyAccessToken = snapshot.val().access_token

        // Create Headers
        const configSpotify = {
            headers: {
                'Host': 'api.spotify.com',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + spotifyAccessToken
            }
        }
        
        // Get Current User
        axios.get("https://api.spotify.com/v1/me", configSpotify)
        .then((response) => {  
            // Post Message
            axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                channel: '#general',
                attachments: JSON.stringify([
                    {
                        callback_id: "spotifybot",
                        color: "#32CD64",
                        title: "SpotifyBot",
                        text: "Welkom " + response.data.display_name + ",\nKlaar om aan de slag te gaan met SpotifyBot?",
                        actions: [
                            {
                                name: "spotify-action",
                                text: "Mijn bibliotheek",
                                style: "default",
                                type: "button",
                                value: "libary"
                            },
                            {
                                name: "spotify-action",
                                text: "Zoeken",
                                style: "default",
                                type: "button",
                                value: "search"
                            },
                            {
                                name: "spotify-action",
                                text: "Profiel",
                                style: "default",
                                type: "button",
                                value: "profile"
                            }
                        ],
                        thumb_url: response.data.images[0].url,
                    }
                ])
            }))
            .then((response) => {
                res.send('');
            }).catch((e) => {
                console.error(e);
            });
        }).catch((e) => {
            console.error(e);
        }); 
    })

    // Finish The Callback
    res.end();
});

// Slash-command: /weather
app.post('/weather', (req, res) => { 

    // Save Trigger Id
    let trigger_id = req.body.trigger_id;

    // Post Message
    axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
        token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
        channel: '#general',
        attachments: JSON.stringify([
            {
                callback_id: "weatherbot",
                color: "#32CD64",
                title: "WeatherBot",
                text: "Wat wilt u doen?",
                actions: [
                    {
                        name: "weather-action",
                        text: "Weersvoorspelling opvragen",
                        style: "default",
                        type: "button",
                        value: "weather-search"
                    }
                ]
            }
        ])
    }))
    .then((response) => {
        res.send('');
    }).catch((e) => {
        console.error(e);
    });

    // Finish The Callback
    res.end();  
});

// Actions
app.post('/actions', urlencodedParser, (req, res) => {

    // Set Reponse Status To 200
    res.status(200).end()

    // Parse the Request to JSON
    const body = JSON.parse(req.body.payload);

    ////////// WeatherBot //////////

    // Weather: Search Dialog
    if (body.actions && body.actions[0].value === 'weather-search') {

        // Save Trigger Id
        let trigger_id = body.trigger_id; 

        // Create Dialog
        const dialog = {
            token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
            trigger_id,
            dialog: JSON.stringify({
                title: 'Weather',
                callback_id: 'weather-search',
                submit_label: 'Zoek',
                elements: [
                {
                    label: 'Stad',
                    type: 'text',
                    name: 'city',
                    value: "",
                    hint: 'Voeg hier je een stad in. Gelieve de stad in de Engelse taal in te geven.',
                },
                ],
            })
        }

        // Post Message
        axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
        .then((result) => {
            debug('dialog.open: %o', result.data);
            console.log(result);
            res.send('');
        }).catch((err) => {
            debug('dialog.open call failed: %o', err);
            res.sendStatus(500);
        });

        // Finish The Callback
        res.end();
    }

    // Weather: City Search
    if (body.submission && body.callback_id === 'weather-search') {
        
        // Save The City
        var city = body.submission.city.trim();

        // Get Weather Information
        weather(city).then(response => {

            // City Exists
            if (response != null) {
                
                function digitize(input, n) {
                    input = input.toString();
                    while(input.length < n) {
                        input = '0' + input;
                    }
                    return input;
                }

                var date = new Date();
                var d = digitize(date.getDate(),2)
                var m = digitize(date.getMonth() + 1, 2)
                var y = date.getFullYear("yy")
                var hours = digitize(date.getHours(),2)
                var min = digitize(date.getMinutes(),2)
                var sec = digitize(date.getSeconds(),2)
                var msec = digitize(date.getMilliseconds(),2)
                var id =  d +'-'+ m +'-'+ y +'_'+ hours +':'+ min +':'+ sec+':'+msec 

                firebase.database().ref('weather/' + id).set({
                    id: id,
                    city: city,
                    temp: response.item.condition.temp,
                    fullResponse: response
                })
                // Post Message
                axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                    token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                    channel: '#general',
                    attachments: JSON.stringify([
                        {
                            color: "#32CD64",
                            title: `WeatherBot`,
                            fields: [
                                {
                                    title: 'Locatie',
                                    value: city,
                                },
                                {
                                    title: "Temperature",
                                    value: response.item.condition.temp + ' °C',
                                    short: true
                                }
                            ],
                        }
                    ])
                }))
                .then((response) => {
                    res.send('');
                }).catch((e) => {
                    console.error(e);
                });
                res.end();
            }

            // City Doesn't Exists
            else {
                // Post Message
                axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                    token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                    channel: '#general',
                    title: 'Spotify search results',
                    attachments: JSON.stringify([
                        {
                            color: "#32CD64",
                            callback_id: `weather-search`,
                            title: `WeatherBot`,
                            fields: [
                                {
                                    value: "Er zijn geen resultaten voor de stad: '" + city +"'.",
                                }
                            ],
                        }
                    ])
                }))
                .then((response) => {
                    res.send('');
                }).catch((e) => {
                    console.error(e);
                });
            }
        })
        .catch(error => {
            console.log(error);
        });

        // Finish The Callback
        res.end();
    }

    // Traffic: Route Search
    if (body.submission && body.callback_id === 'traffic-search') {

        // Save The Parameters
        var destination = body.submission.trafficEndplace.trim().replace(/\s+/g, '+');
        var mode = body.submission.trafficMode.trim().replace(/\s+/g, '+');


        database.ref('geoloc/').orderByValue().limitToLast(3).once("value", function(snapshot) {
            var lat = snapshot.val().lat
            var lng = snapshot.val().lng

            // Get The Route
            axios.get("https://maps.googleapis.com/maps/api/directions/json?origin=" + lat + ',' + lng + "&destination=" + destination + "&mode=" + mode + "&departure_time=now&key=" +  directionsApiKey)
            .then((response) => {
                if(response.data.status === 'NOT_FOUND') {
                    // Post Message
                    axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                        token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                        channel: '#general',
                        attachments: JSON.stringify([
                            {
                                color: "#32CD64",
                                callback_id: `traffic-search-results`,
                                title: `TrafficBot`,
                                fields: [
                                    {
                                        title: "Error",
                                        value: "U gaf een ongeldige eindbestemming op",
                                        short: false
                                    },
                                ],
                            }
                        ])
                    }))
                    .then((response) => {
                        res.send('');
                    }).catch((e) => {
                        console.error(e);
                    });
                } else if (response.data.status === 'ZERO_RESULTS') {
                    // Post Message
                    axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                        token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                        channel: '#general',
                        attachments: JSON.stringify([
                            {
                                color: "#32CD64",
                                callback_id: `traffic-search-results`,
                                title: `TrafficBot`,
                                fields: [
                                    {
                                        title: "Geen resultaten",
                                        value: "Er zijn geen resultaten voor uw zoekopdracht.",
                                        short: false
                                    },
                                ],
                            }
                        ])
                    }))
                    .then((response) => {
                        res.send('');
                    }).catch((e) => {
                        console.error(e);
                    });
                }
                else {

                    // Check The Transport Type
                    var transportType = '';
                    if (mode === 'driving') {
                        transportType = 'Auto';
                    }
                    else if (mode === 'walking') {
                        transportType = 'Te voet';
                    }
                    else if (mode === 'bicycling') {
                        transportType = 'Fiets';
                    }
                    else if (mode === 'transit') {
                        transportType = 'Openbaar vervoer';
                    }

                    // Go To The Firebase Database
                    firebase.database().ref('traffic').set({
                        response: response.data,
                        transportType: transportType
                    })

                    // Post Message
                    axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                        token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                        channel: '#general',
                        attachments: JSON.stringify([
                            {
                                color: "#32CD64",
                                callback_id: `traffic-search-results`,
                                title: `TrafficBot`,
                                fields: [
                                    {
                                        title: "Start Adres",
                                        value: response.data.routes[0].legs[0].start_address,
                                        short: true
                                    },
                                    {
                                        title: "Eindbestemming",
                                        value: response.data.routes[0].legs[0].end_address,
                                        short: true
                                    },
                                    {
                                        title: "Duur",
                                        value: response.data.routes[0].legs[0].duration.text,
                                        short: true
                                    },
                                    {
                                        title: "Afstand",
                                        value: response.data.routes[0].legs[0].distance.text,
                                        short: true
                                    },
                                    {
                                        title: "Vervoersmiddel",
                                        value: transportType,
                                        short: true
                                    }
                                ],
                            }
                        ])
                    }))
                    .then((response) => {
                        res.send('');
                    }).catch((e) => {
                        console.error(e);
                    });
                }
                res.send(''); 
            }).catch((e) => {
                console.error(e);
            });

            // Finish Callback
            res.end();
        })

    }

    ////////// SpotifyBot //////////

    // Spotify: Libary Dialog
    if (body.actions && body.actions[0].value === 'libary') {  

        // Go To The Firebase Database     
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Post Message
            axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                channel: '#general',
                title: 'Spotify search results',
                attachments: JSON.stringify([
                    {
                        color: "#32CD64",
                        callback_id: `spotify-track`,
                        title: "SpotifyBot",
                        text: "Wat wil je bekijken?",
                        actions: [
                            {
                                name: "spotify-action",
                                text: "Afspeellijsten",
                                type: "button",
                                style: "default",
                                value: "playlists-section"
                            },
                            {
                                name: "spotify-action",
                                text: "Albums",
                                type: "button",
                                style: "default",
                                value: "albums-section"
                            }
                        ],
                    }
                ])
            }))
            .then((response) => {
                res.send('');
            }).catch((e) => {
                console.error(e);
            });

            // Finish The Callback
            res.end(); 
        });
    }

    // Spotify: Playlist Section
    if (body.actions && body.actions[0].value === 'playlists-section') {  
        
        // Go To The Firebase Database
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) { 

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Post Message
            axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                channel: '#general',
                attachments: JSON.stringify([
                    {
                        color: "#32CD64",
                        callback_id: `spotify-track`,
                        title: "SpotifyBot - Afspeellijsten",
                        text: "Hier kunt u al je afspeellijsten beheren.",
                        actions: [
                            {
                                name: "spotify-action",
                                text: "Playlist aanmaken",
                                style: "default",
                                type: "button",
                                value: "playlist-create"
                            },
                            {
                                name: "spotify-action",
                                text: "Mijn afspeellijsten",
                                type: "button",
                                style: "default",
                                value: "own-playlists"
                            },
                            {
                                name: "spotify-action",
                                text: "Favoriete afspeellijsten",
                                type: "button",
                                style: "default",
                                value: "favo-playlists"
                            },
                        ],
                    }
                ])
            }))
            .then((response) => {
                res.send('');
            }).catch((e) => {
                console.error(e);
            });

            // Finish The Callback
            res.end();
            })
    }

    // Spotify: Album Section
    if (body.actions && body.actions[0].value === 'albums-section') {  

        // Go To The Firebase Database
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Post Message
            axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                channel: '#general',
                attachments: JSON.stringify([
                    {
                        color: "#32CD64",
                        callback_id: `spotify-track`,
                        title: "SpotifyBot - Albums",
                        text: "Hier kunt u al je albums beheren.",
                        actions: [
                            {
                                name: "spotify-action",
                                text: "Mijn albums",
                                type: "button",
                                style: "default",
                                value: "saved-abums"
                            },
                        ],
                    }
                ])
            }))
            .then((response) => {
                res.send('');
            }).catch((e) => {
                console.error(e);
            });

            // Finish The Callback
            res.end();
        })
    }

    // Spotify: Profile
    if (body.actions && body.actions[0].value === 'profile') {

        // Go To The Firebase Database
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Get Current User  
            axios.get('https://api.spotify.com/v1/me', configSpotify)
            .then((response) => {   
                // Post message
                axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                    token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                    channel: '#general',
                    attachments: JSON.stringify([
                        {
                            color: "#32CD64",
                            callback_id: `spotify-track`,
                            title: "SpotifyBot - Profiel",
                            fields: [
                                { 
                                    title: "Naam",
                                    value: response.data.display_name,
                                    short: true
                                },
                                { 
                                    title: "Geboortedatum",
                                    value: response.data.birthdate,
                                    short: true
                                },
                                { 
                                    title: "Land",
                                    value: response.data.country,
                                    short: true
                                },
                                { 
                                    title: "Aantal volgers",
                                    value: response.data.followers.total,
                                    short: true
                                },
                                { 
                                    title: "Account type",
                                    value: response.data.product,
                                    short: true
                                },
                                { 
                                    title: "E-mailadres",
                                    value: response.data.email,
                                    short: true
                                } 
                            ],
                            thumb_url: response.data.images[0].url
                        }
                    ])
                }))
                .then((response) => {
                    res.send('');
                }).catch((e) => {
                    console.error(e);
                });
                res.send('');
            }).catch((e) => {
                console.error(e);
            }); 

            // Finish The Callback
            res.end();    
        })
    }

    // Spotify: Search Dialog
    if (body.actions && body.actions[0].value === 'search') {

        // Save Trigger Id
        let trigger_id = body.trigger_id;

        // Go To The Firebase Database   
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }
            
            // Create Dialog
            const dialog = {
                token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                trigger_id,
                dialog: JSON.stringify({
                    title: 'Spotify',
                    callback_id: 'spotify-search',
                    submit_label: 'Zoek',
                    elements: [
                    {
                        label: 'Type',
                        type: 'select',
                        name: 'type',
                        options: [
                        { label: 'Afspeellijst', value: 'playlist' },
                        { label: 'Album', value: 'album' },
                        { label: 'Nummer', value: 'track' },
                        ],
                    },
                    {
                        label: 'Zoekterm',
                        type: 'text',
                        name: 'query',
                        value: "",
                        hint: 'Voeg hier je zoekterm in',
                    },
                    ],
                })
            }

            // Post Message
            axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
            .then((result) => {
                debug('dialog.open: %o', result.data);
                res.send('');
            }).catch((err) => {
                debug('dialog.open call failed: %o', err);
                res.sendStatus(500);
            });

            // Finish Callback
            res.end();
        })
    }

    // Spotify: Playlist Search
    if (body.submission && body.submission.type === 'playlist') {

        // Go To The Firebase Database
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Save The Playlist
            var playlist = body.submission.query.trim();

            // Get Playlist
            axios.get('https://api.spotify.com/v1/search?q=' + playlist + '&type=playlist', configSpotify)
            .then(response => {
                // Playlist Not Found
                if (response.data.playlists.total === 0) {
                    // Post Message
                    axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                        token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                        channel: '#general',
                        title: 'Spotify search results',
                        attachments: JSON.stringify([
                            {
                                color: "#32CD64",
                                callback_id: `spotify-playlist`,
                                title: `SpotifyBot`,
                                fields: [
                                    {
                                        value: "Er zijn geen resultaten voor de zoekterm: '" + playlist +"'.",
                                    }
                                ],
                            }
                        ])
                    }))
                    .then((response) => {
                        res.send('');
                    }).catch((e) => {
                        console.error(e);
                    });
                    res.send('');
                }
                // Playlist Found
                else {
                    // Post Message
                    axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                        token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                        channel: '#general',
                        title: 'Spotify search results',
                        attachments: JSON.stringify([
                            {
                                color: "#32CD64",
                                callback_id: `spotify-playlist`,
                                title: `SpotifyBot`,
                                fields: [
                                    {
                                        title: response.data.playlists.items[0].owner.display_name,
                                        value: response.data.playlists.items[0].name,
                                    }
                                ],
                                actions: [
                                    {
                                        name: "Afspelen",
                                        text: "Afspelen",
                                        type: "button",
                                        value: response.data.playlists.items[0].uri
                                    },
                                    {
                                        name: "Stoppen",
                                        text: "Stoppen",
                                        type: "button",
                                        value: response.data.playlists.items[0].uri
                                    },
                                    {
                                        name: "Vorige",
                                        text: "Vorige",
                                        type: "button",
                                    },
                                    {
                                        name: "Volgende",
                                        text: "Volgende",
                                        type: "button",
                                    },
                                    {
                                        name: "Tracklist",
                                        text: "Tracklist",
                                        type: "button",
                                        value: response.data.playlists.items[0].tracks.href
                                    }
                                ],
                                thumb_url: response.data.playlists.items[0].images[0].url,
                            }
                        ])
                    }))
                    .then((response) => {
                        res.send('');
                    }).catch((e) => {
                        console.error(e);
                    });
                    res.send('');
                }
            }).catch((e) => {
                console.error(e);
            });

            // Finish Callback
            res.end();
        })
    }
    
    // Spotify: Album Search
    if (body.submission && body.submission.type === 'album') {

        // Go To The Firebase Database
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Save The Album 
            var album = body.submission.query.trim();

            // Get Album
            axios.get('https://api.spotify.com/v1/search?q=' + album + '&type=album', configSpotify)
            .then(response => {
                // Album Not Found
                if (response.data.albums.total === 0) {
                    // Post Message
                    axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                        token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                        channel: '#general',
                        title: 'Spotify search results',
                        attachments: JSON.stringify([
                            {
                                color: "#32CD64",
                                callback_id: `spotify-playlist`,
                                fields: [
                                    {
                                        value: "Er zijn geen resultaten voor de zoekterm: '" + album +"'.",
                                    }
                                ],
                            }
                        ])
                    }))
                    .then((response) => {
                        res.send('');
                    }).catch((e) => {
                        console.error(e);
                    });
                    res.send('');
                }
                // Album Found
                else {
                    // Post Message
                    axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                        token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                        channel: '#general',
                        attachments: JSON.stringify([
                            {
                                color: "#32CD64",
                                callback_id: `spotify-album`,
                                title: `SpotifyBot`,
                                fields: [
                                    {
                                        value: response.data.albums.items[0].artists[0].name + ` - ` + response.data.albums.items[0].name,
                                    }
                                ],
                                actions: [
                                    {
                                        name: "Afspelen",
                                        text: "Afspelen",
                                        type: "button",
                                        value: response.data.albums.items[0].uri
                                    },
                                    {
                                        name: "Stoppen",
                                        text: "Stoppen",
                                        type: "button",
                                        value: response.data.albums.items[0].uri
                                    },
                                    {
                                        name: "Vorige",
                                        text: "Vorige",
                                        type: "button",
                                    },
                                    {
                                        name: "Volgende",
                                        text: "Volgende",
                                        type: "button",
                                    },
                                ],
                                thumb_url: response.data.albums.items[0].images[0].url,
                            }
                        ])
                    }))
                    .then((response) => {
                        res.send('');
                    }).catch((e) => {
                        console.error(e);
                    });
                    res.send('');
                }
            }).catch((e) => {
                console.error(e);
            });

            // Finish The Callback
            res.end();
        })
    }

    // Spotify: Track Search
    if (body.submission && body.submission.type === 'track') {

        // Go To The Firebase Database
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Save The Track
            var track = body.submission.query.trim();

            // Get Track
            axios.get('https://api.spotify.com/v1/search?q=' + track + '&type=track', configSpotify)
            .then(response => {
                // Resave The Track
                var track = response.data;
                // Get The Current User
                axios.get("https://api.spotify.com/v1/me", configSpotify)
                .then((response) => {
                    // Save The User Id
                    var userId = response.data.id;
                    // Get Playlists From The Current User
                    axios.get('https://api.spotify.com/v1/users/' + userId + '/playlists', configSpotify)
                    .then(response => {
                        console.log(response.data.items[0].owner.id)
                        var options = [];
                        var i = 0;
                        for (i = 0; i < response.data.items.length; i++) { 
                            if(response.data.items[i].owner.id === userId) {
                                var row = { 
                                    text: response.data.items[i].name,
                                    value: track.tracks.items[0].uri + ', ' + response.data.items[i].id
                                };
                                options.push(row);
                            }
                        } 
                        // Post Message
                        axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                            token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                            channel: '#general',
                            title: 'Spotify search results',
                            attachments: JSON.stringify([
                                {
                                    color: "#32CD64",
                                    callback_id: `spotify-track`,
                                    title: `SpotifyBot`,
                                    fields: [
                                        {
                                            title: "Nummer",
                                            value: track.tracks.items[0].name + ` - ` + track.tracks.items[0].artists[0].name,
                                        }
                                    ],
                                    actions: [
                                        {
                                            name: "Nummer toevoegen",
                                            text: "Toevoegen aan afspeellijst",
                                            "type": "select",
                                            "options": options
                                        }
                                    ],
                                    thumb_url: track.tracks.items[0].album.images[0].url,
                                }
                            ])
                        }))
                        .then((response) => {
                            res.send('');
                        }).catch((e) => {
                            console.error(e);
                        });
                        res.send('');
                    }).catch((e) => {
                        console.error(e);
                    });
                    res.send('');
                }).catch((e) => {
                console.error(e);
                });
                res.send('');
            }).catch((e) => {
                console.error(e);
            });

            // Finish The Callback
            res.end();
        })
    }
    // Spotify Player: Play
    if (body.actions && body.actions[0].name === "Afspelen") {

        // Go To The Firebase Database
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Play The Current Context
            // axios.put("https://api.spotify.com/v1/me/player/play",
            // {
            //     "context_uri": body.actions[0].value,
            // }, 
            // configSpotify)

            var uri = body.actions[0].value;

            // Check If Context Is Playlist
            if (uri.indexOf('playlist') > -1) {
                
                if (uri.indexOf('favo, ') > -1) {
                    var newUri = uri.split("favo, ");
                    var userId = uri.split("user:");
                    var ID = userId[1].split(":playlist:");
                    axios.get('https://api.spotify.com/v1/users/' + ID[0] + '/playlists/' + ID[1], configSpotify)
                    .then(response => {
                        // Save The Playlist
                        var playlistForFirebase = response.data;
                        // Go To The Firebase Database + Save The Playlist
                        firebase.database().ref('spotify').set({
                            response: playlistForFirebase,
                        })
                        axios.put("https://api.spotify.com/v1/me/player/play",
                        {
                            "context_uri": newUri[1],
                        }, 
                        configSpotify)
                        res.send('');
                    })
                    .catch((e) => {
                        console.error(e);
                    })
                }
                else {
                    // Save Playlists Id
                    var playlistId = uri.split("playlist:");
                    // Get The Current User
                    axios.get("https://api.spotify.com/v1/me", configSpotify)
                    .then(response => {
                        // Save The User Id
                        var userId = response.data.id;
                        // Get The Playlist
                        axios.get('https://api.spotify.com/v1/users/' + userId + '/playlists/' + playlistId[1], configSpotify)
                        .then(response => {
                            // Save The Playlist
                            var playlistForFirebase = response.data;
                            // Go To The Firebase Database + Save The Playlist
                            firebase.database().ref('spotify').set({
                                response: playlistForFirebase,
                            })
                            axios.put("https://api.spotify.com/v1/me/player/play",
                            {
                                "context_uri": body.actions[0].value,
                            }, 
                            configSpotify)
                            res.send('');
                        })
                        .catch((e) => {
                            console.error(e);
                        })
                        res.send('');
                    })
                    .catch((e) => {
                        console.error(e);
                    })
                }
            }

            // Check If Context Is Album
            if (uri.indexOf('album') > -1) {
                // Save Album Id
                var albumId = uri.split("album:");
                // Get The Album
                axios.get('https://api.spotify.com/v1/albums/' + albumId[1], configSpotify)
                .then((response) => {
                    // Save The Album
                    var albumForFirebase = response.data;
                    // Go To The Firebase Database + Save The Album
                    firebase.database().ref('spotify').set({
                        response: albumForFirebase,
                    })
                    axios.put("https://api.spotify.com/v1/me/player/play",
                    {
                        "context_uri": body.actions[0].value,
                    }, 
                    configSpotify)
                    res.send('');
                }).catch((e) => {
                    console.error(e);
                });
            }

            // Create Messsage
            var message = {
                "text": "*" + body.user.name + "* heeft op *" + body.actions[0].name + "* gedrukt.",
                "replace_original": false
            }

            // Send Message
            sendMessageToSlackResponseURL(body.response_url, message)
        })
    }

    // Spotify Player: Stop
    if (body.actions && body.actions[0].name === "Stoppen") {

        // Go To The Firebase Database
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Pause The Current Context
            axios.put("https://api.spotify.com/v1/me/player/pause", 
            {
                "context_uri": body.actions[0].value,
            }, 
            configSpotify)

            // Create Message
            var message = {
                "text": "*" + body.user.name + "* heeft op *" + body.actions[0].name + "* gedrukt.",
                "replace_original": false
            }

            // Send Message 
            sendMessageToSlackResponseURL(body.response_url, message)

            // Finish The Callback
            res.end();
        })
    }

    // Spotify Player: Previous Track
    if (body.actions && body.actions[0].name === "Vorige") {

        // Go To The Firebase Database
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Play The Previous Track Of The Current Context
            axios.post("https://api.spotify.com/v1/me/player/previous", 
            {

            }, 
            configSpotify)
            .then((response) => {
                res.send('');
            }).catch((e) => {
                console.error(e);
            });

            // Create Message
            var message = {
                "text": "*" + body.user.name + "* heeft op *" + body.actions[0].name + "* gedrukt.",
                "replace_original": false
            }

            // Send Message
            sendMessageToSlackResponseURL(body.response_url, message)

            // Finish The Callback
            res.end();
        })
    }
    // Spotify Player: Next Track
    if (body.actions && body.actions[0].name === "Volgende") {

        // Go To The Firebase Database
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            axios.post("https://api.spotify.com/v1/me/player/next", 
            {

            }, 
            configSpotify)
            .then((response) => {
                res.send('');
            }).catch((e) => {
                console.error(e);
            });

            // Create Message
            var message = {
                "text": "*" + body.user.name + "* heeft op *" + body.actions[0].name + "* gedrukt.",
                "replace_original": false
            }

            // Send Message
            sendMessageToSlackResponseURL(body.response_url, message)

            // Finish The Callback
            res.end();
        })
    }

    // Spotify Player: Tracklist of a Playlist
    if (body.actions && body.actions[0].name === "Tracklist") {

        // Go To The Firebase Database
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Get Tracklist Of The Current Context
            axios.get(body.actions[0].value, configSpotify)
            .then(response => {
                // Create Tracks Array
                var tracks = [];
                // Create Index Variable
                var i = 0;
                // Push Every Track + Artist Into The Array
                for (i = 0; i < response.data.items.length; i++) { 
                    var row = { 
                        title: response.data.items[i].track.artists[0].name,
                        value: response.data.items[i].track.name,
                        short: true
                    }   
                    tracks.push(row);
                }
                // Post Message
                axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                    token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                    channel: '#general',
                    attachments: JSON.stringify([
                        {
                            color: "#32CD64",
                            callback_id: `spotify-playlists`,
                            title: `SpotifyBot - Tracklist`,
                            fields: tracks
                        }
                    ])
                }))
                .then((response) => {
                    res.send('');
                }).catch((e) => {
                    console.error(e);
                });
                res.send('');
            })
            .catch((e) => {
                console.error(e);
            });

            // Create Message
            var message = {
                "text": "*" + body.user.name + "* heeft op *" + body.actions[0].name + "* gedrukt.",
                "replace_original": false
            }

            // Send Message 
            sendMessageToSlackResponseURL(body.response_url, message)

            // Finish Callback
            res.end();
        })
    }

    // Spotify Player: Tracklist of a Album
    if (body.actions && body.actions[0].name === "Tracklist album") {

        // Go To The Firebase Database
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token
            
            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Get Tracklist Of The Current Context
            axios.get(body.actions[0].value, configSpotify)
            .then(response => {
                // Create Tracks Array
                var tracks = [];
                // Create Index Variable
                var i = 0;
                // Push Every Track + Artist Into The Array
                for (i = 0; i < response.data.items.length; i++) { 
                    var row = { 
                        title: response.data.items[i].artists[0].name,
                        value: response.data.items[i].name,
                        short: true
                    }   
                    tracks.push(row);
                }
                // Post Message
                axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                    token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                    channel: '#general',
                    attachments: JSON.stringify([
                        {
                            color: "#32CD64",
                            callback_id: `spotify-playlists`,
                            title: `SpotifyBot - Tracklist`,
                            fields: tracks
                        }
                    ])
                }))
                .then((response) => {
                    res.send('');
                }).catch((e) => {
                    console.error(e);
                });
                res.send('');
            })
            .catch((e) => {
                console.error(e);
            });

            // Create Message
            var message = {
                "text": "*" + body.user.name + "* heeft op *" + body.actions[0].name + "* gedrukt.",
                "replace_original": false
            }

            // Send Message
            sendMessageToSlackResponseURL(body.response_url, message)
            res.end('');
        })
    }

    // Spotify: Add Track Playlist
    if (body.actions && body.actions[0].name === "Nummer toevoegen") {

        // Go To The Firebase Database
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Save The Query
            var query = body.actions[0].selected_options[0].value;
            // Create Parameters Array
            var parameters = new Array();
            // Split The Query And Save It To The Parameters Array
            parameters = query.split(", ");

            // Get The Current User
            axios.get('https://api.spotify.com/v1/me', configSpotify)
            .then((response) => {
                // Save The User Id
                var userId = response.data.id;
                // Add The Track To The Selected Playlist
                axios.post('https://api.spotify.com/v1/users/' + userId + '/playlists/' + parameters[1] + '/tracks',
                {
                    uris: [parameters[0]],
                    position: 0
                }, 
                configSpotify)
                .then((response) => {
                    res.send('');
                }).catch((e) => {
                    console.error(e);
                });
                res.send('');
            }).catch((e) => {
                console.error(e);
            });

            // Create Message
            var message = {
                text: '*' + body.user.name + '* heeft op *' + body.actions[0].name + '* gedrukt.',
                replace_original: false
            }

            // Send Message
            sendMessageToSlackResponseURL(body.response_url, message)

            // Finish The Callback
            res.end();
        })
    }

    // Spotify: Create Playlist Dialog
    if (body.actions && body.actions[0].value === 'playlist-create') {   

        // Save Trigger Id
        let trigger_id = body.trigger_id; 

        // Go To The Firebase Database
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Create Dialog
            const dialog = {
                token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                trigger_id,
                dialog: JSON.stringify({
                    title: 'Spotify',
                    callback_id: 'spotify-playlist-create',
                    submit_label: 'Zoek',
                    elements: [
                    {
                        label: 'Naam',
                        type: 'text',
                        name: 'name',
                        value: "",
                        hint: 'Voeg de naam van de playlist in.',
                    },
                    {
                        label: 'Type playlist',
                        type: 'select',
                        name: 'type',
                        options: [
                            { label: 'Publiek', value: "true" },
                            { label: 'Privé', value: "false" },
                        ],
                    },
                    {
                        label: 'Beschrijving',
                        type: 'textarea',
                        name: 'description',
                        value: "",
                        hint: 'Voeg een beschrijving van de playlist in.',
                        optional: true
                    },
                    ],
                })
            }

            // Post Message
            axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
            .then((result) => {
                debug('dialog.open: %o', result.data);
                console.log(result.data.response_metadata);
                res.send('');
            }).catch((err) => {
                debug('dialog.open call failed: %o', err);
                console.log(err);
                res.sendStatus(500);
            });

            // Finish The Callback
            res.end();
        })
    }

    // Spotify: Create Playlist
    if (body.submission && body.callback_id === 'spotify-playlist-create') {

        // Go To The Firebase Database
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Get The Current User
            axios.get("https://api.spotify.com/v1/me", configSpotify)
            .then((response) => {
                // Save The Current User
                var userId = response.data.id;
                // Create The Playlist
                axios.post("https://api.spotify.com/v1/users/" + userId + "/playlists/",
                {
                    "description": body.submission.description,
                    "public": body.submission.type,
                    "name": body.submission.name
                },
                configSpotify)
                .then((response) => {
                    res.send('');
                }).catch((e) => {
                    console.error(e);
                });
                res.send('');
            }).catch((e) => {
                console.error(e);
            });

            // Finisch The Callback
            res.end();
        })
    }
    // Spotify: Get Own Playlists
    if (body.actions && body.actions[0].value === 'own-playlists') {  

        // Go To The Firebase Database 
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Get The Current User
            axios.get("https://api.spotify.com/v1/me", configSpotify)
            .then((response) => {
                // Save The UserId
                var userId = response.data.id;
                // Get Playlists From The Current User
                axios.get('https://api.spotify.com/v1/users/' + userId + '/playlists', configSpotify)
                .then(response => {
                    // Create Playlist Array
                    var playlists = [];
                    // Create Index Variable
                    var i = 0;
                    // Push Every Playlist Into The Array
                    for (i = 0; i < response.data.items.length; i++) { 
                        if(response.data.items[i].owner.id === userId) {
                            var row = { 
                                text: response.data.items[i].name,
                                value: response.data.items[i].id
                            };
                            playlists.push(row);
                        }
                    } 
                    // Post Message
                    axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                        token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                        channel: '#general',
                        title: 'Spotify search results',
                        attachments: JSON.stringify([
                            {
                                color: "#32CD64",
                                callback_id: `spotify-playlists`,
                                title: `SpotifyBot`,
                                fields: [
                                    {
                                        title: "Mijn afspeellijsten",
                                        value: "Kies een afspeellijst die je wilt plaatsen in de Spotify Player",
                                    }
                                ],
                                actions: [
                                    {
                                        name: "Own Playlist To Spotify Player",
                                        text: "Afspeellijsten",
                                        type: "select",
                                        options: playlists
                                    }
                                ],
                            }
                        ])
                    }))
                    .then((response) => {
                        res.send('');
                    }).catch((e) => {
                        console.error(e);
                    });
                    res.send('');
                }).catch((e) => {
                    console.error(e);
                });
                res.send('');
            }).catch((e) => {
                console.error(e);
            });

            // Finish The Callback
            res.end();
        })
    }

    // Spotify: Get Favo Playlists
    if (body.actions && body.actions[0].value === 'favo-playlists') {

        // Go To The Firebase Database 
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Get The Current User
            axios.get("https://api.spotify.com/v1/me", configSpotify)
            .then((response) => {
                // Save The User Id
                var userId = response.data.id;
                // Get Playlists From The Current User
                axios.get('https://api.spotify.com/v1/users/' + userId + '/playlists', configSpotify)
                .then(response => {
                    // Create Playlist Array
                    var playlists = [];
                    // Create Index Variable
                    var i = 0;
                    // Push Every Playlist The Was Created By The Current User Into The Array
                    for (i = 0; i < response.data.items.length; i++) { 
                        if(response.data.items[i].owner.id != userId) {
                            var row = { 
                                text: response.data.items[i].name,
                                value: response.data.items[i].id + ', ' + response.data.items[i].owner.id
                            };
                            playlists.push(row);
                        }
                    } 
                    // Post Message
                    axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                        token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                        channel: '#general',
                        title: 'Spotify search results',
                        attachments: JSON.stringify([
                            {
                                color: "#32CD64",
                                callback_id: `spotify-playlists`,
                                title: `SpotifyBot`,
                                fields: [
                                    {
                                        title: "Favoriete afspeellijsten",
                                        value: "Kies een afspeellijst die je wilt plaatsen in de Spotify Player",
                                    }
                                ],
                                actions: [
                                    {
                                        name: "Favo Playlist To Spotify Player",
                                        text: "Afspeellijsten",
                                        type: "select",
                                        options: playlists
                                    }
                                ],
                            }
                        ])
                    }))
                    .then((response) => {
                        res.send('');
                    }).catch((e) => {
                        console.error(e);
                    });
                    res.send('');
                }).catch((e) => {
                    console.error(e);
                });
                res.send('');
            }).catch((e) => {
                console.error(e);
            });

            // Finish The Callback
            res.end('');
        })
    }
    
    // Spotify: Get Save Albums
    if (body.actions && body.actions[0].value === 'saved-abums') {   

        // Go To The Firebase Database
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Get The Saved Albums From The Current User
            axios.get("https://api.spotify.com/v1/me/albums", configSpotify)
            .then((response) => {
                // Create Albums Array
                var albums = [];
                // Create Index Variable
                var i = 0;
                // Push Every Album Title + Artist Into The Albums Array
                for (i = 0; i < response.data.items.length; i++) { 
                    var row = { 
                        text: response.data.items[i].album.artists[0].name + " - " + response.data.items[i].album.name,
                        value: response.data.items[i].album.id
                    };
                    albums.push(row);
                } 
                // Post Message
                axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                    token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                    channel: '#general',
                    title: 'Spotify search results',
                    attachments: JSON.stringify([
                        {
                            color: "#32CD64",
                            callback_id: `spotify-albums`,
                            title: `SpotifyBot`,
                            fields: [
                                {
                                    title: "Mijn albums",
                                    value: "Kies een Album die je wilt plaatsen in de Spotify Player",
                                }
                            ],
                            actions: [
                                {
                                    name: "Album To Spotify Player",
                                    text: "Albums",
                                    type: "select",
                                    options: albums
                                }
                            ],
                        }
                    ])
                }))
                .then((response) => {
                    res.send('');
                }).catch((e) => {
                    console.error(e);
                });
                res.send('');
            }).catch((e) => {
                console.error(e);
            });

            // Finish The Callback
            res.end();
        })
    }

    // Spotify: Push Saved Album To Spotify Player
    if (body.actions && body.actions[0].name === 'Album To Spotify Player') {   

        // Go To The Firebase Database
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Save The AlbumId
            var albumId = body.actions[0].selected_options[0].value

            // Get The Selected Album
            axios.get("https://api.spotify.com/v1/albums/" + albumId, configSpotify)
            .then((response) => {
                // Post Message
                axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                    token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                    channel: '#general',
                    title: 'Spotify search results',
                    attachments: JSON.stringify([
                        {
                            color: "#32CD64",
                            callback_id: `spotify-saved-album`,
                            title: `SpotifyBot`,
                            fields: [
                                {
                                    title: response.data.name,
                                }
                            ],
                            actions: [
                                {
                                    name: "Afspelen",
                                    text: "Afspelen",
                                    type: "button",
                                    value: response.data.uri
                                },
                                {
                                    name: "Stoppen",
                                    text: "Stoppen",
                                    type: "button",
                                    value: response.data.uri
                                },
                                {
                                    name: "Vorige",
                                    text: "Vorige",
                                    type: "button",
                                },
                                {
                                    name: "Volgende",
                                    text: "Volgende",
                                    type: "button",
                                },
                                {
                                    name: "Tracklist album",
                                    text: "Tracklist",
                                    type: "button",
                                    value: response.data.tracks.href
                                }
                            ],
                            thumb_url: response.data.images[0].url
                        }
                    ])
                }))
                .then((response) => {
                    res.send('');
                }).catch((e) => {
                    console.error(e);
                });
                res.send('');
            }).catch((e) => {
                console.error(e);
            });

            // Finish The Callback
            res.end();
        })
    }

    // Spotify: Push Own Playlist To Spotify Player
    if (body.actions && body.actions[0].name === 'Own Playlist To Spotify Player') {

        // Go To The Firebase Database
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Save The PlaylistId
            var playlistId = body.actions[0].selected_options[0].value;

            // Get The Current User
            axios.get("https://api.spotify.com/v1/me", configSpotify)
            .then((response) => {
                // Save The UserId
                var userId = response.data.id;
                // Get The Selected Playlist
                axios.get('https://api.spotify.com/v1/users/' + userId + '/playlists/' + playlistId, configSpotify)
                .then(response => {
                    // Post Message
                    axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                        token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                        channel: '#general',
                        title: 'Spotify search results',
                        attachments: JSON.stringify([
                            {
                                color: "#32CD64",
                                callback_id: `spotify-playlist`,
                                title: `SpotifyBot`,
                                fields: [
                                    {
                                        title: response.data.owner.display_name,
                                        value: response.data.name,
                                    }
                                ],
                                actions: [
                                    {
                                        name: "Afspelen",
                                        text: "Afspelen",
                                        type: "button",
                                        value: response.data.uri
                                    },
                                    {
                                        name: "Stoppen",
                                        text: "Stoppen",
                                        type: "button",
                                        value: response.data.uri
                                    },
                                    {
                                        name: "Vorige",
                                        text: "Vorige",
                                        type: "button",
                                    },
                                    {
                                        name: "Volgende",
                                        text: "Volgende",
                                        type: "button",
                                    },
                                    {
                                        name: "Tracklist",
                                        text: "Tracklist",
                                        type: "button",
                                        value: response.data.tracks.href
                                    }
                                ],
                                thumb_url: response.data.images[0].url,
                            }
                        ])
                    }))
                    .then((response) => {
                        res.send('');
                    }).catch((e) => {
                        console.error(e);
                    });
                    res.send('');
                }).catch((e) => {
                    console.error(e);
                });
                res.send('');
            }).catch((e) => {
                console.error(e);
            });

            // Finish The Callback
            res.end();
        })
    }

    // Spotify: Push Favo Playlist To Spotify Player
    if (body.actions && body.actions[0].name === 'Favo Playlist To Spotify Player') {

        // Go To The Firebase Database
        database.ref('tokens/').orderByValue().limitToLast(1).once("value", function(snapshot) {

            // Get Access token
            var spotifyAccessToken = snapshot.val().access_token

            // Create Headers
            var configSpotify = {
                headers: {
                    'Host': 'api.spotify.com',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + spotifyAccessToken
                }
            }

            // Save The Query
            var query = body.actions[0].selected_options[0].value;
            // Create Parameters Array
            var parameters = new Array();
            // Split The Query And Save It To The Parameters Array
            parameters = query.split(", ");
            // Save PlaylistId
            var playlistId = parameters[0];
            // Save UserId
            var userId = parameters[1];
            // Get The Selected Playlist
            axios.get('https://api.spotify.com/v1/users/' + userId + '/playlists/' + playlistId, configSpotify)
            .then(response => {
                // Post Message
                axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                    token: 'xoxb-268364773893-LrwZgL5REad2jNbvCf5Ud0nd',
                    channel: '#general',
                    title: 'Spotify search results',
                    attachments: JSON.stringify([
                        {
                            color: "#32CD64",
                            callback_id: `spotify-playlist`,
                            title: `SpotifyBot`,
                            fields: [
                                {
                                    title: response.data.owner.display_name,
                                    value: response.data.name,
                                }
                            ],
                            actions: [
                                {
                                    name: "Afspelen",
                                    text: "Afspelen",
                                    type: "button",
                                    value: 'favo, ' + response.data.uri
                                },
                                {
                                    name: "Stoppen",
                                    text: "Stoppen",
                                    type: "button",
                                    value: response.data.uri
                                },
                                {
                                    name: "Vorige",
                                    text: "Vorige",
                                    type: "button",
                                },
                                {
                                    name: "Volgende",
                                    text: "Volgende",
                                    type: "button",
                                },
                                {
                                    name: "Tracklist",
                                    text: "Tracklist",
                                    type: "button",
                                    value: response.data.tracks.href
                                }
                            ],
                            thumb_url: response.data.images[0].url,
                        }
                    ])
                }))
                .then((response) => {
                    res.send('');
                }).catch((e) => {
                    console.error(e);
                });
                res.send('');  
            }).catch((e) => {
                console.error(e);
            });

            // Finish The Callback
            res.end();
        })
    }
});

app.post('/artevelde-bot', function(req, res) {
if (req.body.result && req.body.result.parameters && req.body.result.parameters.emoticon) {
    var slack_message = {
        text: req.body.result.resolvedQuery,
    }
    firebase.database().ref('emoticon').set({
        emoticon: req.body.result.resolvedQuery,
    })
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

app.listen((process.env.PORT || 8000), function() {
    console.log("Server up and listening");
});

