<template>
	<div id="dashboard">
		<div class="container">
			<div class="loader"></div>
			<div class="item item-1">
				<div class="song">
					<p class="title">{{ blocks.songs.prev.songTitle }}</p>
					<p class="artist">{{ blocks.songs.prev.songArtist }}</p>
				</div>
				<h2>{{ blocks.songs.prev.title }}</h2>
				<div class="image"></div>
			</div>
			<div class="item item-2">
				<div class="song">
					<p class="title">{{ blocks.songs.now.songTitle }}</p>
					<p class="artist">{{ blocks.songs.now.songArtist }}</p>
				</div>
				<h2>{{ blocks.songs.now.title }}</h2>
				<div class="image"></div>
			</div>
			<div class="item item-3">
				<div class="song">
					<p class="title">{{ blocks.songs.next.songTitle }}</p>
					<p class="artist">{{ blocks.songs.next.songTitle }}</p>
				</div>
				<h2>{{ blocks.songs.next.title }}</h2>
				<div class="image"></div>
				<!--<p>Login</p>
				<iframe src="https://spotify-auth-bad.herokuapp.com/" width="100%" style="height: 36px;border: none;"></iframe>
				<a class="btn btn-primary" v-on:click="login">Log in with Spotify</a>
				<button class="btn btn-default" id="obtain-new-token">Obtain new token using the refresh token</button>-->
			</div>
			<div class="item item-4">
				<div class="city">
					<p class="temp">{{ blocks.weather.cities[2].temp }} °C</p>
					<p class="name">{{ blocks.weather.cities[2].name }}</p>
				</div>
				<div class="image"></div>
			</div>
			<div class="item item-5">
				<div class="city">
					<p class="temp">{{ blocks.weather.cities[1].temp }} °C</p>
					<p class="name">{{ blocks.weather.cities[1].name }}</p>
				</div>
				<div class="image"></div>
			</div>
			<div class="item item-6">
				<div class="city">
					<p class="temp">{{ blocks.weather.cities[0].temp }} °C</p>
					<p class="name">{{ blocks.weather.cities[0].name }}</p>
				</div>
				<div class="image"></div>
			</div>
			<div class="item item-7">
				<div id="map"></div>
			</div>
		</div>
	</div>
</template>

<script>
/* eslint-disable */
import axios from 'axios'
import firebase from 'firebase'

export default {
  name: 'app',
	data () {
		return {
			title: 'Dashboard',
			googleApiKey: 'AIzaSyCp5XnmC_WkpgsLgLNQSOMAoyHZdu-MDms',
			blocks: {
				songs: {
					prev: {
						title: 'Previous Track',
						songTitle: 'Brihang',
						songArtist: 'Kleine Dagen'
					},
					now: {
						title: 'Now Playing',
						songTitle: 'Get Lucky',
						songArtist: 'Daft Punk'
					},
					next: {
						title: 'Next Track',
						songTitle: 'No One Knows',
						songArtist: 'Queens Of The Stone Age'
					}
				},
				weather: {
					cities: []
				}
			},
			config: {
				apiKey: "AIzaSyDLSIo2nzvZF49pLQT4XjiDfo2K4Yk41bo",
				authDomain: "bot-agency-dashboard.firebaseapp.com",
				databaseURL: "https://bot-agency-dashboard.firebaseio.com/"
			},
			client_id: '4088e29d220e4827a37bbc08f408bdce',
			client_secret: '2c0f33ca417f4c8fb4669937ffc9f676',
			redirect_uri: 'http%3A%2F%2Flocalhost%3A8080%2F%23%2F',
			body: ''
		}
	},
	mounted: function() {
		this.getData()
	},
	created () {
		firebase.initializeApp(this.config)

		this.updateDataOnTrigger()
		this.deleteLastItem()
		this.update()
		this.getGeoLocation()
	},
	methods: {
		login() {
			window.location.href = 'https://spotify-authentification.herokuapp.com/'
		},
		getGeoLocation() {
			console.log('Trying to get your geolocation...')
			axios.post('https://www.googleapis.com/geolocation/v1/geolocate?key=' + this.googleApiKey)
			.then((response) => {
				var data = response.data
				firebase.database().ref('geoloc').set({
					lat: data.location.lat,
					lng: data.location.lng,
					accuracy: data.accuracy
				})
			}).catch((e) => {
				console.error(e);
			}); 
		},
		getData() {
			console.log('Getting data from firebase ...')
			var database = firebase.database()
			var citiesArray = this.blocks.weather.cities

			var refCities = database.ref('cities')

			refCities.orderByValue().limitToLast(3).on("value", function(snapshot) {
				snapshot.forEach(function(data) {
					citiesArray.push(data.val());
				});
			});
		},
		updateDataOnTrigger() {
			var database = firebase.database()
			var citiesArray = this.blocks.weather.cities

			var refCities = database.ref('cities')

			refCities.on('child_changed', function(dataaa) {
				refCities.orderByValue().limitToLast(3).on("value", function(snapshot) {
					citiesArray.length = 0
					snapshot.forEach(function(data) {
						citiesArray.push(data.val());
					});
				});
			});

		},
		deleteLastItem() {
			var citiesRef = firebase.database().ref('cities')
			var ref = firebase.database().ref('cities').limitToFirst(1)

			citiesRef.once("value").then(function(snapshot) {
				if (snapshot.numChildren() > 3) {
					ref.once("value", function(snapshot) {
						console.log(snapshot.val())
					})
				}
			});
		},
		update() {
			var database = firebase.database()
			var citiesArray = this.blocks.weather.cities

			var refCities = database.ref('cities')

			refCities.on('child_added', function(dataaa) {
				refCities.orderByValue().limitToLast(3).on("value", function(snapshot) {
					citiesArray.length = 0
					snapshot.forEach(function(data) {
						citiesArray.push(data.val());
					});
				});
			});
		}
	}
}
</script>

<style>
	#map {
		width: 100%;
		height: 100%;
		background-color: grey;
	}

	h1 {
		font-weight: normal;
	}
	h2 {
		color: white;
		font-weight: bold;
		text-transform: uppercase;
		font-size: 16px;
		position: absolute;
		bottom: 0;
		left: 16px;
		z-index: 10;
	}
	p {
		color: white;
	}
	a {
	color: #35495E;
	}
	.container {
	display: grid;
	grid-template-columns: 25vw 25vw 25vw 25vw;
	grid-template-rows: calc(50vh - 28px) calc(50vh - 28px);
	}
	.song,
	.city {
		text-align: center;
		padding: calc(50vh / 2 - 56px) 0;
		z-index: 9;
		position: absolute;
		width: calc(100% - 32px);
		text-shadow: 1px 1px 2px rgba(0,0,0,.35)
	}
	.city p.temp {
		font-size: 30px;
		font-weight: bold;
	}
	.song p,
	.city p {
		text-transform: uppercase;
		margin: 0;
	}
	.song p.title {
		font-weight: bold;
		font-size: 30px;
	}
	.song p.artist {
		font-size: 16px;
	}
	.item {
		position: relative;
		background-color: #eee;
		padding: 16px;
	}
	.item.item-1 > .image,
	.item.item-2 > .image, 
	.item.item-3 > .image {
		background: url('../assets/overlay.jpg');
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		background-size: cover;
		opacity: .15;
	}
	.item-1 {
		grid-column-start: 1;
		grid-column-end: 2;
		grid-row-start: 1;
		grid-row-end: 1;
		background-color: #d81786;
	}
	.item-2 {
		grid-column-start: 2;
		grid-column-end: 4;
		grid-row-start: 1;
		grid-row-end: 1;
		background-color: black;
	}
	.item-3 {
		grid-column-start: 4;
		grid-column-end: 5;
		grid-row-start: 1;
		grid-row-end: 1;
		background-color: #ABACAC;
	}

	/* BOTTOM ROW */
	.item-4 {
		grid-column-start: 1;
		grid-column-end: 2;
		grid-row-start: 2;
		grid-row-end: 2;
		background-color: #F7AD2A;
	}
	.item-5 {
		grid-column-start: 2;
		grid-column-end: 3;
		grid-row-start: 2;
		grid-row-end: 3;
		background-color: #b1cc11;
	}
	.item-6 {
		grid-column-start: 3;
		grid-column-end: 4;
		grid-row-start: 2;
		grid-row-end: 4;
		background-color: #1BAAC4;
	}
	.item-7 {
		grid-column-start: 4;
		grid-column-end: 5;
		grid-row-start: 2;
		grid-row-end: 5;
		background-color: #ABACAC;
	}
</style>
