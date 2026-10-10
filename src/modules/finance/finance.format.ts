import type { Money } from '@/modules/finance/finance.types'

export function formatMoney(value: Money | null | undefined) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0))
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN').format(date)
}

export const paymentMethodLabel = (value: string) =>
  value === 'bank_transfer' ? 'Chuyển khoản' : 'Tiền mặt'

export const receiptTypeLabel = (value: string) =>
  ({ deposit: 'Đặt cọc', contract_payment: 'Thanh toán hợp đồng', other: 'Khác' })[value] ?? value

export const expenseScopeLabel = (value: string) =>
  ({ vehicle: 'Xe', trip: 'Chuyến xe', general: 'Chi phí chung' })[value] ?? value

export const advanceStatusLabel = (value: string) =>
  ({ pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', payroll_locked: 'Đã chốt lương' })[value] ??
  value

export const attendanceStatusLabel = advanceStatusLabel

export const payrollStatusLabel = (value: string) =>
  ({
    draft: 'Nháp',
    calculated: 'Đã tính',
    approved: 'Đã duyệt',
    paid: 'Đã chi',
    locked: 'Đã chốt',
  })[value] ?? value

export const workTypeLabel = (value: string) =>
  ({ fixed_trip: 'Chuyến cố định', tourism_trip: 'Chuyến du lịch', other: 'Công khác' })[value] ??
  value

export function stateClass(state: string) {
  if (['locked', 'payroll_locked'].includes(state)) return 'bg-muted text-muted-foreground'
  if (['paid', 'confirmed', 'approved'].includes(state)) return 'bg-success/15 text-success'
  if (['calculated'].includes(state)) return 'bg-primary/10 text-primary'
  return 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
}
