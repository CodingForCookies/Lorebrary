import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: () => (import(/* webpackChunkName: "about" */ './views/main/Main.vue')),
      children: [
        {
          path: 'search',
          name: 'Global Search',
          component: () => (import(/* webpackChunkName: "about" */ './views/Search.vue'))
        },
        {
          path: 'notes/:noteId?',
          name: 'Global Notes',
          component: () => (import(/* webpackChunkName: "about" */ './views/Notes.vue'))
        },

        {
          path: '',
          name: 'Dashboard',
          component: () => (import(/* webpackChunkName: "about" */ './views/main/Dashboard.vue'))
        },
        {
          path: 'account',
          name: 'Account',
          component: () => (import(/* webpackChunkName: "about" */ './views/main/Account.vue'))
        },
      ]
    },
    {
      path: '/universes/:universe',
      component: () => (import(/* webpackChunkName: "about" */ './views/universe/Main.vue')),
      children: [
        {
          path: 'search',
          name: 'Search',
          component: () => (import(/* webpackChunkName: "about" */ './views/Search.vue'))
        },
        {
          path: 'notes/:noteId?',
          name: 'Notes',
          component: () => (import(/* webpackChunkName: "about" */ './views/Notes.vue'))
        },

        {
          path: '',
          name: 'Overview',
          component: () => (import(/* webpackChunkName: "about" */ './views/Unimplemented.vue'))
        },
        {
          path: 'codex',
          name: 'Codex',
          meta: { darkAppBar: true },
          component: () => (import(/* webpackChunkName: "about" */ './views/universe/Codex.vue'))
        },
        {
          path: 'maps',
          name: 'Atlas',
          component: () => (import(/* webpackChunkName: "about" */ './views/Unimplemented.vue'))
        },
        {
          path: 'timelines',
          name: 'Timelines',
          component: () => (import(/* webpackChunkName: "about" */ './views/Unimplemented.vue'))
        },
        {
          path: 'stories',
          name: 'Stories',
          component: () => (import(/* webpackChunkName: "about" */ './views/Unimplemented.vue'))
        },
        {
          path: 'resources',
          component: () => (import(/* webpackChunkName: "about" */ './views/Container.vue')),
          children: [
            {
              path: 'categories',
              name: 'Categories',
              component: () => (import(/* webpackChunkName: "about" */ './views/Unimplemented.vue'))
            },
            {
              path: 'images',
              name: 'Images',
              component: () => (import(/* webpackChunkName: "about" */ './views/Unimplemented.vue'))
            },
            {
              path: 'templates',
              name: 'Templates',
              component: () => (import(/* webpackChunkName: "about" */ './views/Unimplemented.vue'))
            },
          ]
        },
        {
          path: 'settings',
          component: () => (import(/* webpackChunkName: "about" */ './views/Container.vue')),
          children: [
            {
              path: 'collaborators',
              name: 'Collaborators',
              component: () => (import(/* webpackChunkName: "about" */ './views/Unimplemented.vue'))
            },
            {
              path: 'followers',
              name: 'Followers',
              component: () => (import(/* webpackChunkName: "about" */ './views/Unimplemented.vue'))
            },
            {
              path: 'settings',
              name: 'Settings',
              component: () => (import(/* webpackChunkName: "about" */ './views/Unimplemented.vue'))
            }
          ]
        }
      ]
    }
  ]
})