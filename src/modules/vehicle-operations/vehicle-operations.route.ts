import type { RouteRecordRaw } from 'vue-router'

export const VehicleOperationsRoute: RouteRecordRaw[] = [
  {
    path: 'worker-vehicles',
    name: 'worker-vehicles',
    component: () => import('./VehicleRunsPage.vue'),
    meta: {
      permission: 'worker-vehicles.view',
      title: 'Xe chạy công nhân',
      props: { kind: 'worker' },
    },
    props: { kind: 'worker' },
  },
  {
    path: 'tourist-vehicles',
    name: 'tourist-vehicles',
    component: () => import('./VehicleRunsPage.vue'),
    meta: { permission: 'tourist-vehicles.view', title: 'Xe chạy du lịch' },
    props: { kind: 'tourist' },
  },
  {
    path: 'worker-vehicle-schedules',
    name: 'worker-vehicle-schedules',
    component: () => import('./WorkerSchedulesPage.vue'),
    meta: { permission: 'worker-vehicle-schedules.manage', title: 'Lịch xe công nhân' },
  },
  {
    path: 'worker-vehicle-rates',
    name: 'worker-vehicle-rates',
    component: () => import('./WorkerRatesPage.vue'),
    meta: { permission: 'worker-vehicle-rates.view', title: 'Bảng giá xe công nhân' },
  },
]
