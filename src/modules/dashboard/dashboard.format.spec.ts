import { describe, expect, it } from 'vitest'
import { dashboardStatusLabel, formatDashboardMoney } from './dashboard.format'

describe('dashboard formatters', () => {
  it('maps dispatch statuses to the operating labels used by the dashboard', () => {
    expect(dashboardStatusLabel.PLANNED).toBe('Chờ phân công')
    expect(dashboardStatusLabel.IN_PROGRESS).toBe('Đang chạy')
    expect(dashboardStatusLabel.COMPLETED).toBe('Hoàn tất')
  })

  it('formats financial values and keeps unauthorized values hidden', () => {
    expect(formatDashboardMoney('1250000.00')).toBe('1.250.000 đ')
    expect(formatDashboardMoney(null)).toBe('—')
  })
})
