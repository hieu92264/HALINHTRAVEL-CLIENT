import { describe, expect, it } from 'vitest'
import { sidebarNavigation, type SidebarGroup } from './sidebar-data'

describe('điều hướng báo cáo', () => {
  it('chỉ giữ các báo cáo tổng hợp có thể mở chi tiết trong bảng', () => {
    const reports = sidebarNavigation.find(
      (node): node is SidebarGroup => node.kind === 'group' && node.id === 'reports',
    )
    const routeNames = reports?.items.map((item) => item.routeName) ?? []

    expect(routeNames).toContain('report-customer-debts')
    expect(routeNames).toContain('report-partner-debts')
    expect(routeNames).toContain('report-driver-payroll')
    expect(routeNames).not.toContain('report-customer-debt-details')
    expect(routeNames).not.toContain('report-partner-debt-details')
    expect(routeNames).not.toContain('report-driver-payroll-details')
  })
})
