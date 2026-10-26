import { describe, expect, it } from 'vitest'
import { payrollPeriodIssues } from './payroll-period'

describe('payrollPeriodIssues', () => {
  const now = new Date('2025-01-01T00:00:00+07:00')
  it('accepts a completed month across the year boundary', () => {
    expect(payrollPeriodIssues({ year: 2024, month: 12, from_date: '2024-12-01', to_date: '2024-12-31' }, now)).toEqual([])
  })
  it('rejects current and future months and reports both problems', () => {
    expect(payrollPeriodIssues({ year: 2025, month: 1, from_date: '2025-01-01', to_date: '2025-01-31' }, now)).toHaveLength(1)
    expect(payrollPeriodIssues({ year: 2025, month: 2, from_date: '2024-01-01', to_date: '2024-01-31' }, now)).toHaveLength(2)
  })
  it('checks the actual stored range and leap-year end date', () => {
    expect(payrollPeriodIssues({ year: 2024, month: 2, from_date: '2024-02-01', to_date: '2024-02-29' }, now)).toEqual([])
    expect(payrollPeriodIssues({ year: 2024, month: 2, from_date: '2024-02-01', to_date: '2024-02-28' }, now)).toHaveLength(1)
  })
  it('uses the Vietnamese calendar around midnight', () => {
    const period = { year: 2024, month: 12, from_date: '2024-12-01', to_date: '2024-12-31' }
    expect(payrollPeriodIssues(period, new Date('2024-12-31T16:59:59Z'))).toHaveLength(1)
    expect(payrollPeriodIssues(period, new Date('2024-12-31T17:00:00Z'))).toEqual([])
  })
})