<template>
	<div id="dashboard">
		<div class="container">
			<div class="loader"></div>

			<!-- Tracklist -->
			<div class="item item-1">
				<ol>
					<li v-for="value in blocks.spotify.response[0].tracks.items">
						<strong>{{ value.track.artists[0].name }} - </strong>
						{{ value.track.name }}
						<div class="duration">{{ msToTime(value.track.duration_ms) }}</div>
						</li>
				</ol>
				<h2>Tracklist</h2>
			</div>

			<!-- IF album -->
			<div v-if="blocks.spotify.response[0].type === 'album'" class="item item-2">
				<div class="detail">
					<div class="head">
						<img width="80" :src="blocks.spotify.response[0].images[1].url">
						<div>
							<h1 class="title">{{ blocks.spotify.response[0].name }}</h1>
							<p>{{ blocks.spotify.response[0].owner.display_name }}</p>
						</div>
					</div>
					<ul>
						<li>Tracks: <strong>{{ blocks.spotify.response[0].tracks.total }}</strong></li>
						<li>Followers: <strong>{{ blocks.spotify.response[0].followers.total }}</strong></li>
					</ul>
					<h2>{{ blocks.spotify.response[0].type }}</h2>
					<div class="image" :style="{ 'background-image': 'url(' + blocks.spotify.response[0].images[0].url + ')' }"></div>
				</div>
			</div>

			<!-- IF playlist -->
			<div v-if="blocks.spotify.response[0].type === 'playlist'" class="item item-2">
				<div class="detail">
					<div class="head">
						<img width="80" :src="blocks.spotify.response[0].images[1].url">
						<div>
							<h1 class="title">{{ blocks.spotify.response[0].name }}</h1>
							<p>{{ blocks.spotify.response[0].owner.display_name }}</p>
						</div>
					</div>
					<ul>
						<li>Tracks: <strong>{{ blocks.spotify.response[0].tracks.total }}</strong></li>
						<li>Followers: <strong>{{ blocks.spotify.response[0].followers.total }}</strong></li>
					</ul>
					<h2>{{ blocks.spotify.response[0].type }}</h2>
					<div class="image" :style="{ 'background-image': 'url(' + blocks.spotify.response[0].images[0].url + ')' }"></div>
				</div>
			</div>

			<!-- CITIES -->
			<template v-for="(city, index) in blocks.weather.cities">
				<div :class="['item item-' + (index + 4)]">
					<div class="city">
						<p class="temp">{{ city.temp }} °C</p>
						<p class="name">{{ city.name }}</p>
					</div>
					<div class="image"></div>
				</div>
			</template>

			<!-- TRAFFIC -->
			<div class="item item-7">
				<div class="dur-dis">
					<p class="dis">{{ blocks.traffic.data[0] }}</p>
					<p class="dur">{{ blocks.traffic.data[1] }}</p>
				</div>

				<div class="route">
					<p class="start">
						<i class="far fa-dot-circle"></i> 
						{{ splitAdres(blocks.traffic.data[3]) }}
					</p>
					<div class="dots">
						<div><i class="fas fa-circle xs"></i></div>
						<div><i class="fas fa-circle xs"></i></div>
						<div><i class="fas fa-circle xs"></i></div>
					</div>
					<p class="end">
						<i class="fas fa-map-marker-alt"></i>
						{{ splitAdres(blocks.traffic.data[4]) }}
					</p>
				</div>
				<div class="vehicle">
					<template v-if="blocks.traffic.data[2] === 'Auto'">
						<i class="fas fa-car fa-4x"></i>
					</template>
					<template v-if="blocks.traffic.data[2] === 'Bus'">
						<i class="fas fa-bus fa-4x"></i>
					</template>
				</div>
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
				spotify: {
					response: []
				},
				weather: {
					cities: []
				},
				traffic: {
					data: []
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
			body: '',
			img: []
		}
	},
	mounted: function() {
		this.getData()
	},
	created () {
		firebase.initializeApp(this.config)

		this.getGeoLocation()
		this.updateDataOnTrigger()
		this.deleteLastItem()
		
	},
	filters: {
		splitAdres: function (value) {
			if (value) {
				var str = value
				var split = str.split(',', 1)[0]
				return split
			}
		}
	},
	methods: {
		login() {
			window.location.href = 'https://spotify-authentification.herokuapp.com/'
		},
		splitAdres (value) {
			if (value) {
				var str = value
				var split = str.split(',', 1)[0]
				return split
			}
		},
		msToTime(s) {
			var ms = s % 1000;
			s = (s - ms) / 1000;
			var secs = ('0' + s % 60).slice(-2);
			s = (s - secs) / 60;
			var mins = ('0' + s % 60).slice(-2);

			return mins + ':' + secs;
		},
		getTrafficInfo() {
			
		},
		getGeoLocation() {
			axios.post('https://www.googleapis.com/geolocation/v1/geolocate?key=' + this.googleApiKey)
			.then((response) => {
				var data = response.data
				setTimeout(function() 
				{ 
					console.log(data)
				}, 3000);
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
			var spotifyArray = this.blocks.spotify.response
			var trafficArray = this.blocks.traffic.data

			var refCities = database.ref('cities')
			var refSpotify = database.ref('spotify')
			var refTraffic = database.ref('traffic')
			
			refCities.orderByValue().limitToLast(3).on("value", function(snapshot) {
				snapshot.forEach(function(data) {
					citiesArray.push(data.val());
				});
			});

			refSpotify.orderByValue().on("value", function(snapshot) {
				snapshot.forEach(function(data) {
					spotifyArray.push(data.val());
				});
			});

			refTraffic.orderByValue().on("value", function(snapshot) {
				snapshot.forEach(function(data) {
					trafficArray.push(data.val());
				});
			});
		},
		updateDataOnTrigger() {
			var database = firebase.database()

			var cities = this.blocks.weather.cities
			var spotify = this.blocks.spotify.response
			var traffic = this.blocks.traffic.data

			var refCities = database.ref('cities')
			var refSpotify = database.ref('spotify')
			var refTraffic = database.ref('traffic')

			refCities.on('child_changed', function(d) {
				refCities.orderByValue().limitToLast(3).on("value", function(snapshot) {
					citiesArray.length = 0
					snapshot.forEach(function(data) {
						cities.push(data.val());
					});
				});
			});

			refSpotify.on('child_added', function(d) {
				refSpotify.orderByValue().on("value", function(snapshot) {
					spotify.length = 0
					snapshot.forEach(function(data) {
						spotify.push(data.val());
					});
				});
			});

			refTraffic.on('child_added', function(d) {
				refTraffic.orderByValue().on("value", function(snapshot) {
					traffic.length = 0
					snapshot.forEach(function(data) {
						traffic.push(data.val());
					});
				});
			});

		},
		deleteLastItem() {
			var database = firebase.database()

			var citiesRef = database.ref('cities')
			var refLastCity = database.ref('cities').limitToFirst(1)

			citiesRef.once("value").then(function(snapshot) {
				if (snapshot.numChildren() > 3) {
					refLastCity.once("value").then(function(d) {
						// d.remove()
					})
					// refLastCity.remove()
				}
			});
		}
	}
}
</script>

<style lang="scss">
	body {
	overflow: hidden;
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
	.fas.xs {
		font-size: 5px;
	}

	.container {
		display: grid;
		grid-template-columns: 25vw 25vw 25vw 25vw;
		grid-template-rows: calc(50vh - 28px) calc(50vh - 28px);
	}

	.song,
	.city {
		text-align: center;
		z-index: 9;
		position: absolute;
		width: calc(100% - 32px);
		text-shadow: 1px 1px 2px rgba(0,0,0,.35);
		p {
			text-transform: uppercase;
			margin: 0;
		}
	}

	.city {
		padding: calc(50vh / 2 - 56px) 0;
		p.temp {
			font-size: 30px;
			font-weight: bold;
		}
	} 

	.detail {
		position: relative;
		height: 100%;
		.head {
			h1 { 
				color: white;
				margin: 0;
				font-weight: bold;
				text-transform: uppercase;
			}
			img {
				display: block;
				float: left;
				margin-right: 16px;
			}
		}
		ul {
			padding-left: 96px;
			list-style: none;
			margin-top: 64px;
			li {
				color: white;
				line-height: 2em;
			}
		}
	}

	.item {
		position: relative;
		background-color: #eee;
		padding: 16px;
		ol {
			max-height: calc(100% - 60px);
			overflow: hidden;
			li {
				position: relative;
				color: white;
				line-height: 2em;
				.duration {
					position: absolute;
					right: 0;
					top: 0;
				}
			}
		}
		&.item-1 {
			grid-column-start: 1;
			grid-column-end: 3;
			grid-row-start: 1;
			grid-row-end: 1;
			background-color: #d81786;
		}
		&.item-2 {
			grid-column-start: 3;
			grid-column-end: 5;
			grid-row-start: 1;
			grid-row-end: 1;
			background-color: rgba(0,0,0,.85);
			.image {
				position: absolute;
				top: -16px;
				left: -16px;
				height: calc(100% + 32px);
				width: calc(100% + 32px);
				background-size: cover;
				background-position: center;
				z-index: -1;
			}
		}

		/* BOTTOM ROW */
		&.item-4 {
			grid-column-start: 1;
			grid-column-end: 2;
			grid-row-start: 2;
			grid-row-end: 2;
			background-color: #F7AD2A;
		}
		&.item-5 {
			grid-column-start: 2;
			grid-column-end: 3;
			grid-row-start: 2;
			grid-row-end: 3;
			background-color: #b1cc11;
		}
		&.item-6 {
			grid-column-start: 3;
			grid-column-end: 4;
			grid-row-start: 2;
			grid-row-end: 4;
			background-color: #1BAAC4;
		}
		&.item-7 {
			grid-column-start: 4;
			grid-column-end: 5;
			grid-row-start: 2;
			grid-row-end: 5;
			background-color: #242424;
			.dur-dis {
				position: absolute;
				top: 16px;
				right: 16px;
				border-radius: 50%;
				height: 100px;
				width: 100px;
				background-color: white;
				p {
					color: #242424;
					text-align: center;
					margin: 0;
					&.dis {
						font-size: 1.2em;
						margin-top: 27px;
						font-weight: bold;
					}
					&.dur {
					}
				}
			}
			.route {
				padding-top: 120px;
				p {
					margin: 0;
					&.start {}
					&.end { margin-top: 4px; }
				}
				i {
					width: 20px;
					text-align: center;
				}
			}
			.dots {
				div {
					line-height: 7px;
				}
			}
			.vehicle {
				position: absolute;
				bottom: 16px;
			}
		}
	}
</style>
