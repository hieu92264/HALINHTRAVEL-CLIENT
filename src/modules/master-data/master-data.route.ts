import type { RouteRecordRaw } from 'vue-router'

export const MasterDataRoute: RouteRecordRaw[] = [
  {
    path: 'customers',
    name: 'customers',
    component: () => import('@/modules/master-data/customer/CustomerPage.vue'),
    meta: { permission: 'customers.view', title: 'Thông tin khách hàng' },
  },
  {
    path: 'partners',
    name: 'partners',
    component: () => import('@/modules/master-data/partner/PartnerPage.vue'),
    meta: { permission: 'partners.view', title: 'Thông tin đối tác' },
  },
  {
    path: 'vehicle-types',
    name: 'vehicle-types',
    component: () => import('@/modules/master-data/vehicle-type/VehicleTypePage.vue'),
    meta: { permission: 'vehicle-types.view', title: 'Thông tin loại xe' },
  },
  {
    path: 'vehicles',
    name: 'vehicles',
    component: () => import('@/modules/master-data/vehicles/VehiclePage.vue'),
    meta: { permission: 'vehicles.view', title: 'Danh sách xe' },
  },
]
