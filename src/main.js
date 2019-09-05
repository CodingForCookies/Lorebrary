import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@fortawesome/fontawesome-free/css/all.css';

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
