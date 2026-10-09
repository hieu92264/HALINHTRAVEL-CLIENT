import type { QuotationStatus, RentalRequestStatus, RentalServiceType } from './rental.types'

const requestStatusLabels: Record<RentalRequestStatus, string> = {
  new: 'Mới', quoted: 'Đã báo giá', accepted: 'Đã chấp nhận', rejected: 'Từ chối', converted: 'Đã chuyển hợp đồng',
}
const quotationStatusLabels: Record<QuotationStatus, string> = {
  draft: 'Dự thảo', sent: 'Đã gửi', approved: 'Đã duyệt', rejected: 'Từ chối', expired: 'Hết hạn', superseded: 'Đã thay thế',
}
const serviceLabels: Record<RentalServiceType, string> = {
  fixed: 'Tuyến cố định', tourism: 'Tour du lịch', school: 'Đưa đón học sinh', business: 'Đưa đón công nhân',
}

export const requestStatusLabel = (status: RentalRequestStatus) => requestStatusLabels[status]
export const quotationStatusLabel = (status: QuotationStatus) => quotationStatusLabels[status]
export const serviceTypeLabel = (service: RentalServiceType) => serviceLabels[service]
export const formatCurrency = (value: string | number) => `${new Intl.NumberFormat('vi-VN').format(Number(value ?? 0))} đ`
export const formatDate = (value: string | null | undefined, withTime = false) => value ? new Intl.DateTimeFormat('vi-VN', { ...(withTime ? { dateStyle: 'short' as const, timeStyle: 'short' as const } : { dateStyle: 'short' as const }), timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value)) : '—'
export const toDateTimeLocal = (value: string | null | undefined) => {
  if (!value) return ''
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(value)).reduce<Record<string, string>>((result, part) => {
    result[part.type] = part.value
    return result
  }, {})

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
}
export const toApiDateTime = (value: string) => value ? value.replace('T', ' ') + (value.length === 16 ? ':00' : '') : value
