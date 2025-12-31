import { createApp } from 'vue';
import App from './App.vue';
import router from './core/router';
import store from './core/store';
import 'tailwindcss/tailwind.css';

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as labsComponents from 'vuetify/labs/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';

const vuetify = createVuetify({
  components: {
    ...components,
    ...labsComponents,
  },
  directives,
  theme: {
    defaultTheme: 'coflow',
    themes: {
      coflow: {
        dark: false,
        colors: {
          primary: '#4353FF',
          secondary: '#673AB7',
          accent: '#E91E63',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          background: '#F5F7FA'
        }
      }
    }
  }
});

// Create app instance
const app = createApp(App);

// Use plugins
app.use(store);
app.use(router);
app.use(vuetify);

// Mount app
app.mount('#app');
