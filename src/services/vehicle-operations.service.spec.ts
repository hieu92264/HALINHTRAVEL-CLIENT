import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get, patch, post } = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), post: vi.fn() }))

vi.mock('@/services/http.service', () => ({ httpService: { get, patch, post } }))

import { VehicleOperationsService } from './vehicle-operations.service'

describe('VehicleOperationsService worker rates', () => {
  const rate = {
    route_id: 9,
    license_plate: '15B-123.45',
    freight_amount: '2500000',
    driver_wage: '300000',
    effective_from: '2026-11-01',
    effective_to: null,
  }

  beforeEach(() => {
    get.mockReset()
    post.mockReset()
    patch.mockReset()
  })

  it('uses only the worker vehicle rate endpoints for list, create and update', async () => {
    get.mockResolvedValueOnce([])
    post.mockResolvedValueOnce({ id: 1, ...rate })
    patch.mockResolvedValueOnce({ id: 1, ...rate, driver_wage: '350000' })

    await expect(VehicleOperationsService.rates()).resolves.toEqual([])
    await expect(VehicleOperationsService.createRate(rate)).resolves.toMatchObject({ id: 1 })
    await expect(
      VehicleOperationsService.updateRate(1, { driver_wage: '350000' }),
    ).resolves.toMatchObject({ driver_wage: '350000' })

    expect(get).toHaveBeenCalledWith('/vehicle-operations/worker-vehicle-rates')
    expect(post).toHaveBeenCalledWith('/vehicle-operations/worker-vehicle-rates', rate)
    expect(patch).toHaveBeenCalledWith('/vehicle-operations/worker-vehicle-rates/1', {
      driver_wage: '350000',
    })
  })
})
