import type { RouteRecordRaw } from 'vue-router'

const dispatchSchedule = () => import('@/modules/dispatch/DispatchSchedulePage.vue')
const rentalCapacity = () => import('@/modules/dispatch/RentalCapacityPage.vue')
const dispatchOrder = () => import('@/modules/dispatch/DispatchOrderPage.vue')
const myDispatchOrderList = () => import('@/modules/dispatch/MyDispatchOrderListPage.vue')
const myDispatchOrderDetail = () => import('@/modules/dispatch/MyDispatchOrderDetailPage.vue')

export const DispatchRoute: RouteRecordRaw[] = [
  {
    path: 'trip-schedules',
    name: 'trip-schedules',
    component: dispatchSchedule,
    meta: { permission: 'trip-schedules.view', title: 'Lịch chuyến' },
  },
  {
    path: 'capacity',
    name: 'rental-capacity',
    component: rentalCapacity,
    meta: { permission: 'rental-capacity.view', title: 'Kiểm tra năng lực' },
  },
  {
    path: 'dispatch-orders',
    name: 'dispatch-orders',
    component: dispatchOrder,
    meta: { permission: 'dispatch-orders.view', title: 'Lệnh điều xe' },
  },
  {
    path: 'my-dispatch-orders',
    name: 'my-dispatch-orders',
    component: myDispatchOrderList,
    meta: { title: 'Lệnh của tôi', roles: ['driver'] },
  },
  {
    path: 'my-dispatch-orders/:id',
    name: 'my-dispatch-order-detail',
    component: myDispatchOrderDetail,
    meta: { title: 'Chi tiết lệnh', roles: ['driver'] },
  },
]
