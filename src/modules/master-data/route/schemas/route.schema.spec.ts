import { describe, expect, it } from 'vitest'
import { createRouteSchema } from './create-route.schema'
import { updateRouteSchema } from './update-route.schema'

const route = () => ({
  name: 'Tuyến qua đêm',
  pickup_location: 'Hà Nội',
  dropoff_location: 'Hải Phòng',
  default_pickup_time: '22:00',
  default_return_time: '02:00',
})

describe('route schemas', () => {
  it('accepts an overnight return time', () => {
    expect(createRouteSchema.safeParse(route()).success).toBe(true)
  })

  it('rejects identical pickup and return times', () => {
    const result = createRouteSchema.safeParse({ ...route(), default_return_time: '22:00' })

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === 'default_return_time')).toBe(true)
  })

  it('rejects identical times when both values are included in an update', () => {
    expect(updateRouteSchema.safeParse({
      default_pickup_time: '06:30',
      default_return_time: '06:30',
    }).success).toBe(false)
  })
})
