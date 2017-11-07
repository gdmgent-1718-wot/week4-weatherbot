# week4-weatherbot

Een Weather Bot gemaakt aan de hand van dialogflow (api.ai), node.js, express.js, slack en de sensehat van de Raspberry Pi 3b.

## Getting Started

### Slack Bot App aanmaken
[Klik hier](https://dialogflow.com/docs/integrations/slack) om de tutorial te volgen om Slack Bot App te maken.

### Node.js + Express.js

De volgende stappen helpen je bij het installeren van het Express.js Framework. Deze laten we draaien op een Node.js server.

1. `npm install express-generator -g`
2. `express --view=ejs weather-bot`
3. `cd weather-bot`
4. `npm install`
5. `npm start`

Het express.js framework draait nu op een localhost aan de hand van Node.js: hhttp://localhost:3000/
Nu gaan dit project plaatsen in de cloud (Heroku).

### Heroku Cloud

1. `git init`
2. `git add .`
3. `git commit -m “init”`
4. `heroku create`
5. `git push heroku master`
6. `curl <link>`

Op de link kan je uiteraard ook je website in de browser bekijken.