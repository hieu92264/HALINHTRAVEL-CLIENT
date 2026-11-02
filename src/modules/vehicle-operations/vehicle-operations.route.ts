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
  { path: 'worker-vehicle-schedules/create', name: 'worker-vehicle-schedules-create', component: () => import('./WorkerScheduleForm.vue'), meta: { permission: 'worker-vehicle-schedules.manage', title: 'Tạo lịch xe công nhân' } },
  { path: 'worker-vehicle-schedules/:id/edit', name: 'worker-vehicle-schedules-edit', component: () => import('./WorkerScheduleForm.vue'), meta: { permission: 'worker-vehicle-schedules.manage', title: 'Cập nhật lịch xe công nhân' } },
  { path: 'worker-vehicles/create', name: 'worker-vehicles-create', component: () => import('./WorkerVehicleForm.vue'), meta: { permission: 'worker-vehicles.manage', title: 'Tạo xe chạy công nhân' } },
  { path: 'worker-vehicles/:id', name: 'worker-vehicles-detail', component: () => import('./WorkerVehicleDetail.vue'), meta: { permission: 'worker-vehicles.view', title: 'Chi tiết xe chạy công nhân' } },
  { path: 'worker-vehicles/:id/edit', name: 'worker-vehicles-edit', component: () => import('./WorkerVehicleForm.vue'), meta: { permission: 'worker-vehicles.manage', title: 'Cập nhật xe chạy công nhân' } },
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
