import type { RouteRecordRaw } from 'vue-router'

export const RentalRoute: RouteRecordRaw[] = [
  {
    path: 'rental-requests',
    name: 'rental-requests',
    component: () => import('./rental-request/RentalRequestPage.vue'),
    meta: { title: 'Yêu cầu thuê xe' },
  },
  {
    path: 'rental-requests/create',
    name: 'rental-requests-create',
    component: () => import('./rental-request/CreateRentalRequest.vue'),
    meta: { title: 'Tạo yêu cầu thuê xe' },
  },
  {
    path: 'rental-requests/:id',
    name: 'rental-requests-detail',
    component: () => import('./rental-request/RentalRequestDetail.vue'),
    meta: { title: 'Chi tiết yêu cầu thuê xe' },
  },
  {
    path: 'quotations',
    name: 'quotations',
    component: () => import('./quotation/QuotationPage.vue'),
    meta: { title: 'Báo giá' },
  },
  {
    path: 'quotations/create',
    name: 'quotations-create',
    component: () => import('./quotation/CreateQuotation.vue'),
    meta: { title: 'Tạo báo giá' },
  },
  {
    path: 'quotations/:id',
    name: 'quotations-detail',
    component: () => import('./quotation/QuotationDetail.vue'),
    meta: { title: 'Chi tiết báo giá' },
  },
]
