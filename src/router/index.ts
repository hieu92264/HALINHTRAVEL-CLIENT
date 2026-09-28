import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 180,
  minimum: 0.08,
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [],
})

router.beforeEach((to, from) => {
  // Do not flash the indicator when navigation resolves to the current URL.
  if (to.fullPath !== from.fullPath) {
    NProgress.start()
  }
})

router.afterEach(() => {
  NProgress.done()
})

router.onError(() => {
  NProgress.done()
})

export default router
