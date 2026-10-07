import type { QuotationStatus, RentalRequestStatus, RentalServiceType } from './rental.types'

const requestStatusLabels: Record<RentalRequestStatus, string> = {
  new: 'Mới', quoted: 'Đã báo giá', accepted: 'Đã chấp nhận', rejected: 'Từ chối', converted: 'Đã chuyển hợp đồng',
}
const quotationStatusLabels: Record<QuotationStatus, string> = {
  draft: 'Dự thảo', sent: 'Đã gửi', approved: 'Đã duyệt', rejected: 'Từ chối', expired: 'Hết hạn',
}
const serviceLabels: Record<RentalServiceType, string> = {
  fixed: 'Tuyến cố định', tourism: 'Tour du lịch', school: 'Đưa đón học sinh', business: 'Đưa đón công nhân',
}

export const requestStatusLabel = (status: RentalRequestStatus) => requestStatusLabels[status]
export const quotationStatusLabel = (status: QuotationStatus) => quotationStatusLabels[status]
export const serviceTypeLabel = (service: RentalServiceType) => serviceLabels[service]
export const formatCurrency = (value: string | number) => `${new Intl.NumberFormat('vi-VN').format(Number(value ?? 0))} đ`
export const formatDate = (value: string | null | undefined, withTime = false) => value ? new Intl.DateTimeFormat('vi-VN', withTime ? { dateStyle: 'short', timeStyle: 'short' } : { dateStyle: 'short' }).format(new Date(value)) : '—'
export const toDateTimeLocal = (value: string | null | undefined) => value ? value.slice(0, 16) : ''
export const toApiDateTime = (value: string) => value ? value.replace('T', ' ') + (value.length === 16 ? ':00' : '') : value
