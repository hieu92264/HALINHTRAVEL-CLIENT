import type { RouteRecordRaw } from 'vue-router'

export const ReportsRoute: RouteRecordRaw[] = [
  {
    path: 'reports',
    name: 'reports',
    component: () => import('./OperationalReportsPage.vue'),
    meta: { permission: 'payrolls.view', title: 'Báo cáo vận hành và lợi nhuận' },
  },
]
