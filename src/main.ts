import { createApp } from 'vue'
import './assets/style.css'

import App from './App.vue'
import { setupPinia } from './configs/pinia.config'
import { setupVueQuery } from './configs/vue-query.config'
import router from './router'

const app = createApp(App)

setupPinia(app)
app.use(router)
setupVueQuery(app)

app.mount('#app')
