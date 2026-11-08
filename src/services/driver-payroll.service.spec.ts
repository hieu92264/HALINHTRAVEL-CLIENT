import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))

vi.mock('@/services/http.service', () => ({
  httpService: { get, post },
}))

import { DriverPayrollService } from './driver-payroll.service'

describe('DriverPayrollService payroll cancellation', () => {
  beforeEach(() => {
    get.mockReset()
    post.mockReset()
  })

  it('requests cancelled payroll history only when selected', () => {
    DriverPayrollService.getPayrolls()
    expect(get).toHaveBeenLastCalledWith('/driver-payroll/payrolls', { params: undefined })

    DriverPayrollService.getPayrolls(true)
    expect(get).toHaveBeenLastCalledWith('/driver-payroll/payrolls', {
      params: { include_cancelled: '1' },
    })
  })

  it('cancels a draft payroll through its dedicated endpoint', () => {
    DriverPayrollService.cancelPayroll(27)
    expect(post).toHaveBeenCalledWith('/driver-payroll/payrolls/27/cancel')
  })
})
