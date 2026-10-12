import type { RouteRecordRaw } from 'vue-router'

const page = () => import('./ReportsPage.vue')

export const ReportRoute: RouteRecordRaw[] = [
  { path: 'reports/fixed-trips', name: 'report-fixed-trips', component: page, props: { kind: 'fixed-trips' }, meta: { permission: 'dispatch-orders.view', title: 'Báo cáo xe chạy tuyến' } },
  { path: 'reports/tourism-trips', name: 'report-tourism-trips', component: page, props: { kind: 'tourism-trips' }, meta: { permission: 'dispatch-orders.view', title: 'Báo cáo xe du lịch/công tác' } },
  { path: 'reports/finance', name: 'report-finance', component: page, props: { kind: 'finance' }, meta: { title: 'Báo cáo thu chi, chi phí và công nợ' } },
  { path: 'reports/driver-payroll', name: 'report-driver-payroll', component: page, props: { kind: 'driver-payroll' }, meta: { permission: 'payrolls.view', title: 'Báo cáo lương' } },
  { path: 'reports/profit-loss', name: 'report-profit-loss', component: page, props: { kind: 'profit-loss' }, meta: { permission: 'payrolls.view', title: 'Báo cáo lợi nhuận' } },
]
