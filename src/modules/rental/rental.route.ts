import type { RouteRecordRaw } from 'vue-router'

export const RentalRoute: RouteRecordRaw[] = [
  {
    path: 'rental-requests',
    name: 'rental-requests',
    component: () => import('./rental-request/RentalRequestPage.vue'),
    meta: { title: 'Yêu cầu thuê xe' },
  },
  {
    path: 'quotations',
    name: 'quotations',
    component: () => import('./quotation/QuotationPage.vue'),
    meta: { title: 'Báo giá' },
  },
]
