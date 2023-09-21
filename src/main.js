import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

function initVueApp(appElement) {
    if (!appElement) {
      console.warn('Element not found. Retrying or handling gracefully.');
      return;
    }

    const app = createApp(App);

    app.use(createPinia())

    app.mount(appElement);
}

initVueApp(document.getElementById('app'));
