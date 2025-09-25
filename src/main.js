import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/index.ts'
import 'tailwindcss/tailwind.css'

// Create app instance
const app = createApp(App)

// Use plugins
app.use(store)
app.use(router)

// Mount app
app.mount('#app')