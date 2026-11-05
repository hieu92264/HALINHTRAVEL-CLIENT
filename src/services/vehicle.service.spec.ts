import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get, patch, post, remove } = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
  remove: vi.fn(),
}))

vi.mock('@/services/http.service', () => ({ httpService: { get, patch, post, delete: remove } }))

import { VehicleService } from './vehicle.service'

describe('VehicleService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('uses the shared vehicle catalog endpoints', async () => {
    get.mockResolvedValueOnce([]).mockResolvedValueOnce([])
    post.mockResolvedValueOnce({ id: 1 })
    patch.mockResolvedValueOnce({ id: 1 })
    remove.mockResolvedValueOnce(undefined)
    const payload = { license_plate: '15B-123.45', vehicle_type_id: 1, default_driver_id: 2, note: null }

    await VehicleService.getVehicleList()
    await VehicleService.getVehicleOptions()
    await VehicleService.storeVehicle(payload)
    await VehicleService.updateVehicle(1, { vehicle_type_id: 2 })
    await VehicleService.deactivateVehicle(1)

    expect(get).toHaveBeenNthCalledWith(1, '/master-data/vehicles')
    expect(get).toHaveBeenNthCalledWith(2, '/master-data/vehicles/options', { params: undefined })
    expect(post).toHaveBeenCalledWith('/master-data/vehicles', payload)
    expect(patch).toHaveBeenCalledWith('/master-data/vehicles/1', { vehicle_type_id: 2 })
    expect(remove).toHaveBeenCalledWith('/master-data/vehicles/1')
  })
})
