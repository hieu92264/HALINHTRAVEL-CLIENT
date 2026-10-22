import { describe, expect, it } from 'vitest'
import { ReportRoute } from './report.route'

describe('route báo cáo chi tiết cũ', () => {
  it.each([
    ['report-customer-debt-details', 'report-customer-debts', { customer_id: '12' }],
    ['report-partner-debt-details', 'report-partner-debts', { partner_id: '28' }],
    ['report-driver-payroll-details', 'report-driver-payroll', { payroll_id: '44' }],
  ])('chuyển %s về báo cáo cha và giữ query', (name, target, query) => {
    const route = ReportRoute.find((item) => item.name === name)
    expect(route?.redirect).toBeTypeOf('function')

    const redirect = route?.redirect as (to: { query: Record<string, string> }) => unknown
    expect(redirect({ query })).toEqual({ name: target, query })
  })
})
