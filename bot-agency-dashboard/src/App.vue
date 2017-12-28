<template>
  <div id="app">
    <header>
      <span>Bot Agency Dashboard</span>
    </header>
    <main>
      <div class="loader"></div>
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  name: 'app',
  created() {}
}
</script>

<style>
body {
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  font-family: 'Montserrat', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

header {
  margin: 0;
  height: 56px;
  padding: 0 16px;
  background-color: #35495E;
  color: #ffffff;
}
header a {
  color: #fff;
}

header span {
  display: block;
  position: relative;
  font-size: 16px;
  height: 56px;
  line-height: 56px;
  letter-spacing: .02em;
  font-weight: 400;
  box-sizing: border-box;
}
.loader {
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
