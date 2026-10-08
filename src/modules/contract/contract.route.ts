import type { RouteRecordRaw } from 'vue-router'

export const ContractRoute: RouteRecordRaw[] = [
  {
    path: 'contracts',
    name: 'contracts',
    component: () => import('./ContractPage.vue'),
    meta: { permission: 'contracts.view', title: 'Hợp đồng' },
  },
  {
    path: 'contracts/create',
    name: 'contracts-create',
    component: () => import('./CreateContract.vue'),
    meta: { permission: 'contracts.manage', title: 'Tạo hợp đồng' },
  },
  {
    path: 'contracts/from-quotation/:quotationId',
    name: 'contracts-from-quotation',
    component: () => import('./CreateContract.vue'),
    meta: { permission: 'contracts.manage', title: 'Tạo hợp đồng từ báo giá' },
  },
  {
    path: 'contracts/:id/edit',
    name: 'contracts-edit',
    component: () => import('./CreateContract.vue'),
    meta: { permission: 'contracts.manage', title: 'Cập nhật hợp đồng' },
  },
  {
    path: 'contracts/:id',
    name: 'contracts-detail',
    component: () => import('./ContractDetail.vue'),
    meta: { permission: 'contracts.view', title: 'Chi tiết hợp đồng' },
  },
]
