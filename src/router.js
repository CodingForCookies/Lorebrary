import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: () => (import(/* webpackChunkName: "main" */ './views/main/Main.vue')),
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => (import(/* webpackChunkName: "main" */ './views/main/Dashboard.vue'))
        },
        {
          path: 'account',
          name: 'Account',
          component: () => (import(/* webpackChunkName: "main" */ './views/main/Account.vue'))
        },
      ]
    },
    {
      path: '/universes/:universe',
      component: () => (import(/* webpackChunkName: "universe" */ './views/universe/Main.vue')),
      children: [
        {
          path: 'search',
          name: 'Search',
          component: () => (import(/* webpackChunkName: "universe" */ './views/Search.vue'))
        },
        {
          path: 'notes/:noteId?',
          name: 'Notes',
          component: () => (import(/* webpackChunkName: "universe" */ './views/universe/Notes.vue'))
        },

        {
          path: '',
          name: 'Overview',
          component: () => (import(/* webpackChunkName: "universe" */ './views/Unimplemented.vue'))
        },
        {
          path: 'codex/:type?/:article?',
          name: 'Codex',
          meta: { rightDrawer: true },
          component: () => (import(/* webpackChunkName: "universe" */ './views/universe/Codex.vue'))
        },
        {
          path: 'maps',
          name: 'Atlas',
          component: () => (import(/* webpackChunkName: "universe" */ './views/Unimplemented.vue'))
        },
        {
          path: 'timelines',
          name: 'Timelines',
          component: () => (import(/* webpackChunkName: "universe" */ './views/Unimplemented.vue'))
        },
        {
          path: 'stories',
          name: 'Stories',
          component: () => (import(/* webpackChunkName: "universe" */ './views/Unimplemented.vue'))
        },
        {
          path: 'resources',
          component: () => (import(/* webpackChunkName: "resources" */ './views/Container.vue')),
          children: [
            {
              path: 'categories',
              name: 'Categories',
              component: () => (import(/* webpackChunkName: "resources" */ './views/Unimplemented.vue'))
            },
            {
              path: 'images',
              name: 'Images',
              component: () => (import(/* webpackChunkName: "resources" */ './views/Unimplemented.vue'))
            },
            {
              path: 'templates',
              name: 'Templates',
              component: () => (import(/* webpackChunkName: "resources" */ './views/Unimplemented.vue'))
            },
          ]
        },
        {
          path: 'settings',
          component: () => (import(/* webpackChunkName: "settings" */ './views/Container.vue')),
          children: [
            {
              path: 'collaborators',
              name: 'Collaborators',
              component: () => (import(/* webpackChunkName: "settings" */ './views/Unimplemented.vue'))
            },
            {
              path: 'followers',
              name: 'Followers',
              component: () => (import(/* webpackChunkName: "settings" */ './views/Unimplemented.vue'))
            },
            {
              path: 'settings',
              name: 'Settings',
              component: () => (import(/* webpackChunkName: "settings" */ './views/Unimplemented.vue'))
            }
          ]
        }
      ]
    }
  ]
})
