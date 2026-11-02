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
    path: 'drivers',
    name: 'drivers',
    component: () => import('@/modules/master-data/drivers/DriverPage.vue'),
    meta: { permission: 'drivers.view', title: 'Tài xế' },
  },
  {
    path: 'expense-types',
    name: 'expense-types',
    component: () => import('@/modules/master-data/expense-type/ExpenseTypePage.vue'),
    meta: { permission: 'expense-types.view', title: 'Tài xế' },
  },
  {
    path: 'routes',
    name: 'routes',
    component: () => import('@/modules/master-data/route/RoutePage.vue'),
    meta: { permission: 'routes.view', title: 'Tuyến xe' },
  },
]
