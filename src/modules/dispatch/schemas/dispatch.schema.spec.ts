import { describe, expect, it } from 'vitest'
import { completionConfirmationSchema, completionReportSchema, startOrderSchema } from './dispatch.schema'

describe('dispatch payload schemas', () => {
  it('requires start data from the driver', () => {
    expect(startOrderSchema.safeParse({ actual_start_at: '', start_odometer: -1 }).success).toBe(false)
    expect(startOrderSchema.safeParse({ actual_start_at: '2026-10-20T08:00:00+07:00', start_odometer: 1000 }).success).toBe(true)
  })

  it('keeps report payload free of start and finance fields', () => {
    const parsed = completionReportSchema.parse({ actual_end_at: '2026-10-20T12:00:00+07:00', end_odometer: 1100, actual_distance_km: '100', waiting_hours: '0.5' })
    expect(parsed).not.toHaveProperty('customer_amount')
    expect(parsed).not.toHaveProperty('actual_start_at')
  })

  it('uses decimal strings for dispatcher confirmation', () => {
    expect(completionConfirmationSchema.safeParse({ customer_amount: '1500000', partner_vehicle_cost: '0', external_driver_cost: '0' }).success).toBe(true)
    expect(completionConfirmationSchema.safeParse({ customer_amount: 1500000 }).success).toBe(false)
  })
})
