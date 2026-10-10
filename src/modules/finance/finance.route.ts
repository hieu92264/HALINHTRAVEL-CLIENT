import type { RouteRecordRaw } from 'vue-router'

export const FinanceRoute: RouteRecordRaw[] = [
  {
    path: 'finance',
    name: 'finance',
    component: () => import('./FinancePage.vue'),
    meta: { permission: 'receipts.view', title: 'Tài chính và công nợ' },
  },
  {
    path: 'driver-payroll',
    name: 'driver-payroll',
    component: () => import('./PayrollPage.vue'),
    meta: { permission: 'driver-advances.view', title: 'Chấm công và lương' },
  },
  {
    path: 'driver-payroll/payrolls/:id',
    name: 'payroll-detail',
    component: () => import('./PayrollDetail.vue'),
    meta: { permission: 'payrolls.view', title: 'Chi tiết kỳ lương' },
  },
]
