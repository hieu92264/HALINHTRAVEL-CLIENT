import type { RouteRecordRaw } from 'vue-router'

const page = () => import('./ReportsPage.vue')

export const ReportsRoute: RouteRecordRaw[] = [
  { path: 'reports/business-trips', name: 'report-business-trips', component: page, props: { kind: 'business-trips' }, meta: { permission: 'worker-vehicles.view', title: 'Xe chạy công nhân' } },
  { path: 'reports/tourism-trips', name: 'report-tourism-trips', component: page, props: { kind: 'tourism-trips' }, meta: { permission: 'tourist-vehicles.view', title: 'Xe chạy du lịch' } },
  { path: 'reports/customer-debts', name: 'report-customer-debts', component: page, props: { kind: 'customer-debts' }, meta: { permission: 'receipts.view', title: 'Công nợ khách hàng' } },
  { path: 'reports/partner-debts', name: 'report-partner-debts', component: page, props: { kind: 'partner-debts' }, meta: { permission: 'partner-payments.view', title: 'Công nợ chủ xe' } },
  { path: 'reports/driver-payroll', name: 'report-driver-payroll', component: page, props: { kind: 'driver-payroll' }, meta: { permission: 'payrolls.view', title: 'Bảng lương lái xe' } },
  { path: 'reports/vehicle-profit', name: 'report-vehicle-profit', component: page, props: { kind: 'vehicle-profit' }, meta: { permissionsAll: ['worker-vehicles.view', 'tourist-vehicles.view', 'expenses.view', 'partner-payments.view', 'payrolls.view'], title: 'Lợi nhuận xe' } },
  { path: 'reports', redirect: { name: 'report-business-trips' } },
]
