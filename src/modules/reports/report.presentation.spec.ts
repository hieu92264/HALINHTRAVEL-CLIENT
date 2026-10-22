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

  it('dùng nhãn có mã trường cho dữ liệu API chưa được khai báo', () => {
    expect(getReportField('unknown_backend_field').label).toBe(
      'Dữ liệu chưa đặt tên (unknown_backend_field)',
    )
    expect(createReportTotals({ closing_balance: 0, unknown_backend_field: 1 })).toEqual([
      { key: 'closing_balance', label: 'Số dư cuối kỳ', value: expect.any(String) },
      {
        key: 'unknown_backend_field',
        label: 'Dữ liệu chưa đặt tên (unknown_backend_field)',
        value: '1',
      },
    ])
  })

  it('đặt đúng nhãn vận hành cho dữ liệu xe chạy công nhân', () => {
    expect(getReportField('order_no').label).toBe('Số lệnh điều xe')
    expect(getReportField('start_odometer').label).toBe('ODO đầu')
    expect(getReportField('end_odometer').label).toBe('ODO cuối')
    expect(getReportField('trip_count').label).toBe('Số chuyến chạy')
    expect(formatReportValue('total_distance_km', 312)).toBe('312 km')
  })
})
