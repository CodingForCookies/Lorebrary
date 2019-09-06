import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@fortawesome/fontawesome-free/css/all.css';

import VueAnalytics from 'vue-analytics'

const isProd = process.env.NODE_ENV === 'production';

Vue.use(VueAnalytics, {
  id: 'UA-147224195-1',
  fields: {
    dimension1: process.env.VUE_APP_VERSION
  },

  router,
  autoTracking: {
    exception: true,

    // Use screenview instead of pages since we don't care about the entire route (including UUIDs), only how they navigate.
    // screenview: true,
    pageviewTemplate(route) {
      return route.fullPath;
    }
  },
  debug: {
    enabled: !isProd,
    sendHitTask: isProd
  }
});

Vue.config.productionTip = false;

import './messaging';
import drivers from './driver/';

Vue.prototype.$drivers = drivers;

Vue.component('app-footer', require('./components/Footer.vue').default);

/*Vue.mixin({
  computed: {
    $driver: {
      get() { return store.getters.driver; }
    }
  }
})*/

new Vue({
  router,
  store,
  vuetify,
  render: function (h) { return h(App) }
}).$mount('#app')
