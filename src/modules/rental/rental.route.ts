import type { RouteRecordRaw } from 'vue-router'

export const RentalRoute: RouteRecordRaw[] = [
  {
    path: 'rental-requests',
    name: 'rental-requests',
    component: () => import('./rental-request/RentalRequestPage.vue'),
    meta: { permission: 'rental-requests.view', title: 'Yêu cầu thuê xe' },
  },
  {
    path: 'rental-requests/create',
    name: 'rental-requests-create',
    component: () => import('./rental-request/CreateRentalRequest.vue'),
    meta: { permission: 'rental-requests.manage', title: 'Tạo yêu cầu thuê xe' },
  },
  {
    path: 'rental-requests/:id',
    name: 'rental-requests-detail',
    component: () => import('./rental-request/RentalRequestDetail.vue'),
    meta: { permission: 'rental-requests.view', title: 'Chi tiết yêu cầu thuê xe' },
  },
  {
    path: 'rental-requests/:id/edit',
    name: 'rental-requests-edit',
    component: () => import('./rental-request/CreateRentalRequest.vue'),
    meta: { permission: 'rental-requests.manage', title: 'Cập nhật yêu cầu thuê xe' },
  },
  {
    path: 'quotations',
    name: 'quotations',
    component: () => import('./quotation/QuotationPage.vue'),
    meta: { permission: 'quotations.view', title: 'Báo giá' },
  },
  {
    path: 'quotations/create',
    name: 'quotations-create',
    component: () => import('./quotation/CreateQuotation.vue'),
    meta: { permission: 'quotations.manage', title: 'Tạo báo giá' },
  },
  {
    path: 'quotations/:id',
    name: 'quotations-detail',
    component: () => import('./quotation/QuotationDetail.vue'),
    meta: { permission: 'quotations.view', title: 'Chi tiết báo giá' },
  },
  {
    path: 'quotations/:id/edit',
    name: 'quotations-edit',
    component: () => import('./quotation/CreateQuotation.vue'),
    meta: { permission: 'quotations.manage', title: 'Cập nhật báo giá' },
  },
]

export const PublicQuotationRoute: RouteRecordRaw = {
  path: '/quotation-response',
  name: 'quotation-response',
  component: () => import('./quotation/PublicQuotationResponse.vue'),
  meta: { title: 'Phản hồi báo giá' },
}
