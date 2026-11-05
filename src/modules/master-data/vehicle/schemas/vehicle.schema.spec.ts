import { describe, expect, it } from 'vitest'
import { createVehicleSchema } from './create-vehicle.schema'

describe('createVehicleSchema', () => {
  it('requires a vehicle type and a default driver', () => {
    expect(createVehicleSchema.safeParse({ license_plate: '15B-123.45', vehicle_type_id: 0, default_driver_id: null, note: null }).success).toBe(false)
  })

  it('accepts a company vehicle and normalizes optional text', () => {
    const result = createVehicleSchema.parse({ license_plate: '15B-123.45', vehicle_type_id: 1, default_driver_id: 2, note: ' ' })
    expect(result.note).toBeNull()
  })
})
