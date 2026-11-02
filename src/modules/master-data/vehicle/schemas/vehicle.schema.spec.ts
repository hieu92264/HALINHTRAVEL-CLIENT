import { describe, expect, it } from 'vitest'
import { createVehicleSchema } from './create-vehicle.schema'

describe('createVehicleSchema', () => {
  it('requires a positive seat count and a partner for partner vehicles', () => {
    expect(createVehicleSchema.safeParse({ license_plate: '15B-123.45', seat_count: 0, ownership_type: 'partner', partner_id: null, vehicle_model: null, note: null }).success).toBe(false)
  })

  it('accepts a company vehicle and normalizes optional text', () => {
    const result = createVehicleSchema.parse({ license_plate: '15B-123.45', seat_count: 16, ownership_type: 'company', partner_id: null, vehicle_model: ' ', note: ' ' })
    expect(result.vehicle_model).toBeNull()
    expect(result.note).toBeNull()
  })
})
