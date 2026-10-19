import type { RouteRecordRaw } from 'vue-router'

const page = () => import('./ReportsPage.vue')

export const ReportRoute: RouteRecordRaw[] = [
  { path: 'reports/fixed-trips', name: 'report-fixed-trips', component: page, props: { kind: 'fixed-trips' }, meta: { permission: 'dispatch-orders.view', title: 'Báo cáo xe chạy tuyến' } },
  { path: 'reports/tourism-trips', name: 'report-tourism-trips', component: page, props: { kind: 'tourism-trips' }, meta: { permission: 'dispatch-orders.view', title: 'Báo cáo xe du lịch/công tác' } },
  { path: 'reports/finance', name: 'report-finance', component: page, props: { kind: 'finance' }, meta: { title: 'Báo cáo thu chi, chi phí và công nợ' } },
  { path: 'reports/customer-debts', name: 'report-customer-debts', component: page, props: { kind: 'customer-debts' }, meta: { permission: 'receipts.view', title: 'Công nợ khách hàng' } },
  { path: 'reports/customer-debt-details', name: 'report-customer-debt-details', component: page, props: { kind: 'customer-debt-details' }, meta: { permission: 'receipts.view', title: 'Chi tiết công nợ khách hàng' } },
  { path: 'reports/partner-debts', name: 'report-partner-debts', component: page, props: { kind: 'partner-debts' }, meta: { permission: 'partner-payments.view', title: 'Công nợ chủ xe' } },
  { path: 'reports/partner-debt-details', name: 'report-partner-debt-details', component: page, props: { kind: 'partner-debt-details' }, meta: { permission: 'partner-payments.view', title: 'Chi tiết công nợ chủ xe' } },
  { path: 'reports/driver-payroll', name: 'report-driver-payroll', component: page, props: { kind: 'driver-payroll' }, meta: { permission: 'payrolls.view', title: 'Báo cáo lương' } },
  { path: 'reports/driver-payroll-details', name: 'report-driver-payroll-details', component: page, props: { kind: 'driver-payroll-details' }, meta: { permission: 'payrolls.view', title: 'Chi tiết lương lái xe' } },
  { path: 'reports/vehicle-profit', name: 'report-vehicle-profit', component: page, props: { kind: 'vehicle-profit' }, meta: { permission: 'payrolls.view', title: 'Báo cáo lợi nhuận xe' } },
]
