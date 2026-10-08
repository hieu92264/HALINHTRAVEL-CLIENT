import type { Quotation, QuotationStatus, RentalRequestStatus } from './rental.types'

export type DateRange = {
  from: string
  to: string
}

/** Lọc ngày theo chuỗi ISO để giữ nguyên cả hai mốc của khoảng thời gian. */
export function filterByDateRange<T>(
  rows: T[],
  getDate: (row: T) => string | null | undefined,
  range: DateRange,
): T[] {
  return rows.filter((row) => {
    const date = getDate(row)?.slice(0, 10) ?? ''

    return (!range.from || date >= range.from) && (!range.to || date <= range.to)
  })
}

export const isRentalRequestMutable = (status: RentalRequestStatus) => status === 'new'
export const isQuotationDraft = (status: QuotationStatus) => status === 'draft'
export const canSendQuotation = (quotation: Quotation) =>
  isQuotationDraft(quotation.status) && Boolean(quotation.customer_email) && isQuotationCurrent(quotation)
export const canRecordQuotationByPhone = (quotation: Quotation) =>
  (quotation.status === 'sent' || (isQuotationDraft(quotation.status) && !quotation.customer_email)) &&
  isQuotationCurrent(quotation)
export const canExpireQuotation = (status: QuotationStatus) => status === 'sent'
export const isQuotationCurrent = (quotation: Quotation) =>
  Boolean(quotation.valid_until) && quotation.valid_until >= new Date().toISOString().slice(0, 10)
