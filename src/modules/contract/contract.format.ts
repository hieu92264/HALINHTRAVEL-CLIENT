import type { ContractStatus, ContractType, Weekday } from './contract.types'

const contractTypeLabels: Record<ContractType, string> = {
  trip: 'Hợp đồng theo chuyến',
  principle: 'Hợp đồng nguyên tắc',
}
const contractStatusLabels: Record<ContractStatus, string> = {
  draft: 'Nháp',
  active: 'Đang hiệu lực',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}
const weekdayLabels: Record<Weekday, string> = {
  Mon: 'Thứ Hai',
  Tue: 'Thứ Ba',
  Wed: 'Thứ Tư',
  Thu: 'Thứ Năm',
  Fri: 'Thứ Sáu',
  Sat: 'Thứ Bảy',
  Sun: 'Chủ nhật',
}
export const contractTypeLabel = (type: ContractType) => contractTypeLabels[type]
export const contractStatusLabel = (status: ContractStatus) => contractStatusLabels[status]
export const weekdayLabel = (weekday: Weekday) => weekdayLabels[weekday]
