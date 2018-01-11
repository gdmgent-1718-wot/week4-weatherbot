<template>
	<div id="app">
		<header>
			<span><strong>BAD</strong> - Bot Agency Dashboard</span>
			<a class="login" href="https://spotify-auth-bad.herokuapp.com/">Login</a>
			<a href="https://weatherbot-wot.slack.com/oauth/295612897312.6921e0473fb0bfdf77cd1e7d4918507d1fa373e555cd8f41cdbe9b11b63f3792" target="_blank">
				<img src="./assets/slack_mono_w.svg">
			</a>
		</header>
		<main>
			<div id="loader"></div>
			<router-view></router-view>
		</main>
	</div>
</template>
<script>
/* eslint-disable */
export default {
	name: 'app',
	created() {
		let loader = document.getElementById('loader')
		console.log(loader)
	}
}
</script>

<style lang="scss">
	body {
		margin: 0;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	#app {
		font-family: 'Montserrat', Helvetica, Arial, sans-serif;
		color: #2c3e50;
	}

	header {
		margin: 0;
		height: 56px;
		padding: 0 16px;
		background-color: #35495E;
		color: #ffffff;
		position: relative;
		a {
			color: #fff;
		}
		a.login {
			position: absolute;
			top: 10px;
			right: 16px;
			background-color: #1db954;
			color: white;
			text-decoration: none;
			padding: 8px 16px;
			border-radius: 50px;
			transition-property: background-color;
			transition-duration: .3s;
		}
		a.login:hover {
			background-color: #1ed760
		}
		span {
			display: block;
			position: relative;
			font-size: 16px;
			height: 56px;
			line-height: 56px;
			letter-spacing: .02em;
			font-weight: 400;
			box-sizing: border-box;
			margin-left: 100px;
		}
		img {
			position: absolute;
			left: 16px;
			display: block;
			height: 24px;
			top: 16px;
		}
	}


	#loader {
		border: 8px solid #f3f3f3;
		border-top: 8px solid #d81786;
		border-radius: 50%;
		width: 56px;
		height: 56px;
		position: absolute;
		top: calc(50vh - 28px);
		left: calc(50vw - 28px);
		-webkit-animation: spin 2s linear infinite;
		animation: spin 2s linear infinite;
	}

	@-webkit-keyframes spin {
		0% { 
			-webkit-transform: rotate(0deg);
			border-top: 8px solid #d81786;
		}
		20% {
			border-top: 8px solid #ABACAC;
		}
		40% {
			border-top: 8px solid #F7AD2A;
		}
		60% {
			border-top: 8px solid #b1cc11;
		}
		80% {
			border-top: 8px solid #1BAAC4;
		}
		100% { 
			-webkit-transform: rotate(360deg);
			border-top: 8px solid #d81786;
		}
	}

	@keyframes spin {
		0% { 
			transform: rotate(0deg);
			border-top: 8px solid #d81786;
		}
		20% {
			border-top: 8px solid #ABACAC;
		}
		40% {
			border-top: 8px solid #F7AD2A;
		}
		60% {
			border-top: 8px solid #b1cc11;
		}
		80% {
			border-top: 8px solid #1BAAC4;
		}
		100% { 
			transform: rotate(360deg);
			border-top: 8px solid #d81786;
		}
	}
</style>
