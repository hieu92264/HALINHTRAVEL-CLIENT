import type { RouteRecordRaw } from 'vue-router'

const page = () => import('./ReportsPage.vue')

export const ReportRoute: RouteRecordRaw[] = [
  {
    path: 'reports/fixed-trips',
    name: 'report-fixed-trips',
    component: page,
    props: { kind: 'fixed-trips' },
    meta: { permission: 'dispatch-orders.view', title: 'Báo cáo xe chạy công nhân' },
  },
  {
    path: 'reports/tourism-trips',
    name: 'report-tourism-trips',
    component: page,
    props: { kind: 'tourism-trips' },
    meta: { permission: 'dispatch-orders.view', title: 'Báo cáo xe chạy du lịch' },
  },
  {
    path: 'reports/finance',
    name: 'report-finance',
    component: page,
    props: { kind: 'finance' },
    meta: { title: 'Báo cáo thu chi, chi phí và công nợ' },
  },
  {
    path: 'reports/customer-debts',
    name: 'report-customer-debts',
    component: page,
    props: { kind: 'customer-debts' },
    meta: { permission: 'receipts.view', title: 'Công nợ khách hàng' },
  },
  {
    path: 'reports/customer-debt-details',
    name: 'report-customer-debt-details',
    redirect: (to) => ({ name: 'report-customer-debts', query: to.query }),
    meta: { permission: 'receipts.view', title: 'Công nợ khách hàng' },
  },
  {
    path: 'reports/partner-debts',
    name: 'report-partner-debts',
    component: page,
    props: { kind: 'partner-debts' },
    meta: { permission: 'partner-payments.view', title: 'Công nợ chủ xe' },
  },
  {
    path: 'reports/partner-debt-details',
    name: 'report-partner-debt-details',
    redirect: (to) => ({ name: 'report-partner-debts', query: to.query }),
    meta: { permission: 'partner-payments.view', title: 'Công nợ chủ xe' },
  },
  {
    path: 'reports/driver-payroll',
    name: 'report-driver-payroll',
    component: page,
    props: { kind: 'driver-payroll' },
    meta: { permission: 'payrolls.view', title: 'Bảng lương lái xe' },
  },
  {
    path: 'reports/driver-payroll-details',
    name: 'report-driver-payroll-details',
    redirect: (to) => ({ name: 'report-driver-payroll', query: to.query }),
    meta: { permission: 'payrolls.view', title: 'Bảng lương lái xe' },
  },
  {
    path: 'reports/profit-loss',
    name: 'report-profit-loss',
    component: page,
    props: { kind: 'profit-loss' },
    meta: {
      permissionsAll: [
        'dispatch-orders.view',
        'expenses.view',
        'partner-payments.view',
        'payrolls.view',
      ],
      title: 'Báo cáo lợi nhuận',
    },
  },
  {
    path: 'reports/vehicle-profit',
    name: 'report-vehicle-profit',
    component: page,
    props: { kind: 'vehicle-profit' },
    meta: {
      permissionsAll: [
        'dispatch-orders.view',
        'expenses.view',
        'partner-payments.view',
        'payrolls.view',
      ],
      title: 'Báo cáo lợi nhuận xe',
    },
  },
]
