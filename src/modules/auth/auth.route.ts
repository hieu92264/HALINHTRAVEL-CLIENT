import type { RouteRecordRaw } from 'vue-router'

export const AuthRoute: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/auth/login/LoginPage.vue'),
    meta: { title: 'Đăng nhập', guestOnly: true },
  },
]
