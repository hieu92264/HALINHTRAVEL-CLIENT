import { createPinia } from 'pinia'
import type { Pinia } from 'pinia'
import type { App } from 'vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

export function setupPinia(app: App): Pinia {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)

  return pinia
}
