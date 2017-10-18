var express = require('express');
var router = express.Router();

const https = require('https');
https.get("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%3D2502265%20AND%20u%3D'c'&format=json&diagnostics=true&callback=", (resp) => {
  let data = '';
  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });
  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    dataFromJSON = JSON.parse(data).query;
    console.log(data);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    data: dataFromJSON,
  });
});

module.exports = router;
