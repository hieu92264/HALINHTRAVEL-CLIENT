import type { RouteRecordRaw } from 'vue-router'

export const DispatchRoute: RouteRecordRaw[] = [
  { path: 'dispatch/schedules', name: 'dispatch-schedules', component: () => import('./SchedulesPage.vue'), meta: { permission: 'trip-schedules.view', title: 'Lịch chuyến' } },
  { path: 'dispatch/schedules/:id', name: 'dispatch-schedule-detail', component: () => import('./ScheduleDetail.vue'), meta: { permission: 'trip-schedules.view', title: 'Chi tiết lịch chuyến' } },
  { path: 'dispatch/orders', name: 'dispatch-orders', component: () => import('./OrdersPage.vue'), meta: { permission: 'dispatch-orders.view', title: 'Lệnh điều xe' } },
  { path: 'dispatch/orders/:id', name: 'dispatch-order-detail', component: () => import('./OrderDetail.vue'), meta: { permission: 'dispatch-orders.view', title: 'Chi tiết lệnh điều xe' } },
  { path: 'my-orders', name: 'my-orders', component: () => import('./MyOrdersPage.vue'), meta: { permission: 'driver-orders.view', title: 'Lệnh của tôi' } },
  { path: 'my-orders/:id', name: 'my-order-detail', component: () => import('./MyOrderDetail.vue'), meta: { permission: 'driver-orders.view', title: 'Chi tiết lệnh' } },
]
