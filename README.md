# Bot Agency Dashboard

Een Bot en Dashboard gemaakt aan de hand van dialogflow (api.ai), node.js, vue.js slack en de LED Matrix van de Raspberry Pi 3b.

### Authors
1. Niels Cappelle
2. Ismail Kutlu

### API
1. `Spotify API`
2. `Google Maps Directions API`
3. `Yahoo Weather API`
4. `Slack API`

### Slack Bot

Maak een Slack Bot aan en voer de nodige instellingen omtrent Webhooks en Slash commands uit. 
1. `https://api.slack.com/slash-commands`
2. `https://api.slack.com/incoming-webhooks`

### DialogFlow

Integreer je Slack Bot in DialogFlow
1. `https://dialogflow.com/docs/examples/slack-webhook`

### Heroku Cloud Apps opzetten

Dit is nodig voor de volgende repo's:
- `bot`
- `spotify-auth-bad`

1. `git init`
2. `git add .`
3. `git commit -m “init”`
4. `heroku create`
5. `git push heroku master`
6. `curl <link>`

### LED Matrix

1. `npm install`
2. `Node index.js`