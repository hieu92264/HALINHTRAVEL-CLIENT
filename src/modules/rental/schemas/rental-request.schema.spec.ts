import { describe, expect, it } from 'vitest'
import { rentalRequestFormSchema } from './rental-request.schema'

const toLocalInput = (date: Date) => date.toISOString().slice(0, 16)
const payload = () => ({
  customer_id: 1,
  source: null,
  requested_at: toLocalInput(new Date(Date.now() - 60 * 60 * 1000)),
  service_type: 'tourism' as const,
  start_at: toLocalInput(new Date(Date.now() + 24 * 60 * 60 * 1000)),
  end_at: toLocalInput(new Date(Date.now() + 28 * 60 * 60 * 1000)),
  trip_mode: 'custom' as const,
  route_id: 0,
  pickup_location: 'Hà Nội',
  dropoff_location: 'Hạ Long',
  note: null,
  items: [{ vehicle_type_id: 1, quantity: 1, note: null }],
})

describe('rental request schema', () => {
  it('requires an end time after start time', () => {
    const value = payload()
    value.end_at = value.start_at
    expect(rentalRequestFormSchema.safeParse(value).success).toBe(false)
  })

  it('rejects locations that differ only by whitespace and case', () => {
    const value = payload()
    value.dropoff_location = '  hà   nội '
    const result = rentalRequestFormSchema.safeParse(value)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === 'dropoff_location')).toBe(true)
  })
})
