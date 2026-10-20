import { describe, expect, it } from 'vitest'
import {
  createReportTotals,
  formatReportValue,
  getReportField,
  reportFilterPlaceholder,
} from './report.presentation'

describe('trình bày báo cáo', () => {
  it('dịch nhãn cột và placeholder từ khóa API', () => {
    expect(getReportField('partner_id').label).toBe('Mã chủ xe')
    expect(reportFilterPlaceholder('opening_balance')).toBe('Lọc số dư đầu kỳ')
  })

  it('định dạng boolean, tiền tệ và ngày theo tiếng Việt', () => {
    expect(formatReportValue('is_active', true)).toBe('Có')
    expect(formatReportValue('paid_amount', 420000)).toContain('420.000')
    expect(formatReportValue('date', '2026-10-30')).toMatch(/30.*10.*2026/)
  })

  it('dùng nhãn tiếng Việt an toàn cho trường chưa biết và tổng số', () => {
    expect(getReportField('unknown_backend_field').label).toBe('Thông tin khác')
    expect(createReportTotals({ closing_balance: 0, unknown_backend_field: 1 })).toEqual([
      { key: 'closing_balance', label: 'Số dư cuối kỳ', value: expect.any(String) },
      { key: 'unknown_backend_field', label: 'Thông tin khác', value: '1' },
    ])
  })
})
