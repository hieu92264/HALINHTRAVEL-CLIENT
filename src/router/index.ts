import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import { AuthService } from '@/services/auth.service'
import { useAuthStore } from '@/modules/auth/auth.store'
import { useAppStore } from '@/stores/app.store'
import { useTabsStore } from '@/stores/tabs.store'
import { SESSION_EXPIRED_EVENT } from '@/shared/lib/auth-events'
import { AuthRoute } from '@/modules/auth/auth.route'
import { OrganizationRoute } from '@/modules/organization/org.route'
import { MasterDataRoute } from '@/modules/master-data/master-data.route'
import { PublicQuotationRoute, RentalRoute } from '@/modules/rental/rental.route'
import { ContractRoute } from '@/modules/contract/contract.route'
import { FinanceRoute } from '@/modules/finance/finance.route'
import { DispatchRoute } from '@/modules/dispatch/dispatch.route'

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 180,
  minimum: 0.08,
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...AuthRoute,
    PublicQuotationRoute,
    {
      path: '/',
      component: () => import('@/shared/layouts/BaseLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/modules/dashboard/DashboardPage.vue'),
          meta: { title: 'Tổng quan' },
        },
        ...OrganizationRoute,
        ...MasterDataRoute,
        ...RentalRoute,
        ...ContractRoute,
        ...FinanceRoute,
        ...DispatchRoute,
      ],
    },
    {
      path: '/403',
      name: 'forbidden',
      component: () => import('@/modules/errors/pages/ForbiddenPage.vue'),
      meta: { title: 'Không có quyền truy cập' },
    },
    {
      path: '/500',
      name: 'server-error',
      component: () => import('@/modules/errors/pages/ServerErrorPage.vue'),
      meta: { title: 'Lỗi hệ thống' },
    },
    {
      path: '/maintenance',
      name: 'maintenance',
      component: () => import('@/modules/errors/pages/MaintenancePage.vue'),
      meta: { title: 'Bảo trì hệ thống' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/modules/errors/pages/NotFoundPage.vue'),
      meta: { title: 'Không tìm thấy trang' },
    },
  ],
})

router.beforeEach(async (to, from) => {
  // Do not flash the indicator when navigation resolves to the current URL.
  if (to.fullPath !== from.fullPath) {
    NProgress.start()
  }

  const authStore = useAuthStore()
  const appStore = useAppStore()

  if (authStore.accessToken && !authStore.hasLoadedUser) {
    appStore.setBootstrapping(true)
    try {
      authStore.setUser(await AuthService.getMe())
    } catch {
      authStore.clearSession()
    } finally {
      appStore.setBootstrapping(false)
    }
  }

  if (to.meta.guestOnly) {
    return authStore.user ? { name: 'dashboard' } : true
  }

  if (!to.meta.requiresAuth) return true

  if (!authStore.accessToken || !authStore.user) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.permission && !authStore.user.permissions.includes(to.meta.permission)) {
    return { name: 'forbidden' }
  }

  return true
})

router.afterEach((to) => {
  NProgress.done()
  document.title = to.meta.title ? `${to.meta.title} | Hà Linh Travel` : 'Hà Linh Travel'

  if (to.meta.requiresAuth && to.meta.title) {
    useTabsStore().visit({
      title: to.meta.title,
      to: to.fullPath,
      closable: to.name !== 'dashboard',
    })
  }
})

router.onError(() => {
  NProgress.done()
})

if (typeof window !== 'undefined') {
  window.addEventListener(SESSION_EXPIRED_EVENT, () => {
    const currentRoute = router.currentRoute.value
    if (currentRoute.meta.guestOnly) return

    void router.replace({
      name: 'login',
      query: { redirect: currentRoute.fullPath },
    })
  })
}

export default router
