/* eslint-disable */

import Vue from 'vue'
import Router from 'vue-router'
import Bad from '@/components/Bad'

Vue.use(Router)

export default new Router({
	routes: [
		{
			path: '/',
			name: 'Bad',
			component: Bad
		}
	]
})
