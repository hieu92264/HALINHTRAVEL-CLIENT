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
  { path: 'tourist-vehicles/create', name: 'tourist-vehicles-create', component: () => import('./TouristVehicleForm.vue'), meta: { permission: 'tourist-vehicles.manage', title: 'Tạo xe chạy du lịch' } },
  { path: 'tourist-vehicles/:id/edit', name: 'tourist-vehicles-edit', component: () => import('./TouristVehicleForm.vue'), meta: { permission: 'tourist-vehicles.manage', title: 'Cập nhật xe chạy du lịch' } },
  { path: 'tourist-vehicles/:id', name: 'tourist-vehicles-detail', component: () => import('./TouristVehicleDetail.vue'), meta: { permission: 'tourist-vehicles.view', title: 'Chi tiết xe chạy du lịch' } },
]
