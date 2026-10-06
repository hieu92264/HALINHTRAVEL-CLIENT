import type { RouteRecordRaw } from 'vue-router'

const dispatchWorkspace = () => import('@/modules/dispatch/DispatchSchedulePage.vue')

export const DispatchRoute: RouteRecordRaw[] = [
  {
    path: 'trip-schedules',
    name: 'trip-schedules',
    component: dispatchWorkspace,
    meta: { permission: 'trip-schedules.view', title: 'Lịch chuyến' },
  },
  {
    path: 'capacity',
    name: 'rental-capacity',
    component: dispatchWorkspace,
    meta: { permission: 'rental-capacity.view', title: 'Kiểm tra năng lực' },
  },
  {
    path: 'dispatch-orders',
    name: 'dispatch-orders',
    component: dispatchWorkspace,
    meta: { permission: 'dispatch-orders.view', title: 'Lệnh điều xe' },
  },
]
