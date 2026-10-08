import { describe, expect, it } from 'vitest'
import { canConfirmCompletion, canDriverReport, canDriverStart, orderStatusLabels } from './dispatch.format'

describe('dispatch lifecycle presentation', () => {
  it('shows pending confirmation and exposes only the matching driver/dispatcher CTA', () => {
    expect(orderStatusLabels.PENDING_CONFIRMATION).toBe('Chờ điều hành xác nhận')
    expect(canDriverStart('ASSIGNED')).toBe(true)
    expect(canDriverReport('IN_PROGRESS')).toBe(true)
    expect(canConfirmCompletion('PENDING_CONFIRMATION')).toBe(true)
    expect(canDriverReport('PENDING_CONFIRMATION')).toBe(false)
  })
})
