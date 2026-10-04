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
]
