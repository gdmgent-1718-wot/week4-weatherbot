const firebase = require('firebase')
const axios = require('axios')
const { execFile } = require('child_process')



const config = {
	apiKey: "AIzaSyDLSIo2nzvZF49pLQT4XjiDfo2K4Yk41bo",
	authDomain: "bot-agency-dashboard.firebaseapp.com",
	databaseURL: "https://bot-agency-dashboard.firebaseio.com/"
}

firebase.initializeApp(config)

let db = firebase.database()

let emoticon = db.ref('emoticon')


emoticon.on('child_changed', function() {
	emoticon.orderByValue().on('value', function(snapshot) {
		snapshot.forEach(function(data) {
			axios.get('https://www.emojidex.com/api/v1/emoji/' + data.val().replace(/:/g,''))
			.then(function (response) {
				if (response.data.unicode == null) {
					console.log('Unicode does not exist.');
					emoticonUnicode = 'slack'
					const child = execFile('sudo', ['./led-image-viewer', '--led-no-hardware-pulse', './images/' + emoticonUnicode +'.png'], (error, sdout, sterr) => {
					if (error) {
						throw error;
					}
						console.log(sdout);
					});
				}
				else {
					emoticonUnicode = ''
					emoticonUnicode = response.data.unicode
					const child = execFile('sudo', ['./led-image-viewer', '--led-no-hardware-pulse', './images/' + emoticonUnicode +'.png'], (error, sdout, sterr) => {
					if (error) {
						throw error;
					}
						console.log(sdout);
					});
				}
			})
			.catch(function (error) {
				console.log('Emoji bestaat niet');
				emoticonUnicode = 'slack'
				const child = execFile('sudo', ['./led-image-viewer', '--led-no-hardware-pulse', './images/' + emoticonUnicode +'.png'], (error, sdout, sterr) => {
				if (error) {
					throw error;
				}
					console.log(sdout);
				});
			});
		})

		
	})
})

