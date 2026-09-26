import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/style.css'

import App from './App.vue'
import { setupVueQuery } from './configs/vue-query.config'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
setupVueQuery(app)

app.mount('#app')
