import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);
import '../assets/dark.css'

export default new Vuetify({
  icons: {
    iconfont: 'fa',
  },
  theme: {
    dark: false,
    
    themes: {
      light: {
        // primary: '#c49454',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107'
      },
      dark: {
        primary: '#FFF',
      }
    },
  }
});
