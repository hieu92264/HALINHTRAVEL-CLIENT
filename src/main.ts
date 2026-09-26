import { createApp } from 'vue'
import './assets/style.css'

import App from './App.vue'
import { setupAxiosInterceptors } from './configs/axios.config'
import { setupPinia } from './configs/pinia.config'
import { setupVueQuery } from './configs/vue-query.config'
import router from './router'

const app = createApp(App)

const pinia = setupPinia(app)
setupAxiosInterceptors(pinia)
app.use(router)
setupVueQuery(app)

app.mount('#app')
