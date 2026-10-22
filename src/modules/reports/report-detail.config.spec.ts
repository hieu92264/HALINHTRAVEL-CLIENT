import { describe, expect, it } from 'vitest'
import { getDetailFilters, getReportDetailConfig } from './report-detail.config'

describe('cấu hình báo cáo chi tiết', () => {
  it.each([
    ['customer-debts', 'customer-debt-details', 'customer_id', 12],
    ['partner-debts', 'partner-debt-details', 'partner_id', 28],
    ['driver-payroll', 'driver-payroll-details', 'payroll_id', 44],
  ] as const)('ánh xạ %s sang báo cáo chi tiết phù hợp', (kind, detailKind, filterKey, id) => {
    const config = getReportDetailConfig(kind)

    expect(config).toMatchObject({ detailKind, filterKey })
    expect(getDetailFilters({ from_date: '2026-10-01', to_date: '2026-10-31' }, config!, { [filterKey]: id })).toEqual({
      from_date: '2026-10-01',
      to_date: '2026-10-31',
      [filterKey]: String(id),
    })
  })

  it('không tạo truy vấn chi tiết khi dòng tổng hợp thiếu ID', () => {
    const config = getReportDetailConfig('customer-debts')!

    expect(getDetailFilters({ from_date: '2026-10-01', to_date: '2026-10-31' }, config, {})).toBeUndefined()
  })
})
