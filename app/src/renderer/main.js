import Vue from 'vue';
import Electron from 'vue-electron';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';

Vue.use(Electron);
Vue.config.debug = true;

import App from './App';

/* eslint-disable no-new */
new Vue({
  ...App,
}).$mount('#app');
