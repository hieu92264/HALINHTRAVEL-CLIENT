import type { Vehicle } from '@/modules/master-data/master-data.type'
import type { OwnershipTypeEnum } from '@/modules/master-data/master-data.enum'
import type { CreateVehicleDto } from '@/modules/master-data/vehicle/schemas/create-vehicle.schema'
import type { UpdateVehicleDto } from '@/modules/master-data/vehicle/schemas/update-vehicle.schema'
import { httpService } from '@/services/http.service'

export const VehicleURL = '/master-data/vehicles'

export class VehicleService {
  static getVehicleList = () => httpService.get<Vehicle[]>(VehicleURL)
  static getVehicleOptions = (ownershipType?: OwnershipTypeEnum) =>
    httpService.get<Vehicle[]>(`${VehicleURL}/options`, {
      params: ownershipType ? { ownership_type: ownershipType } : undefined,
    })
  static storeVehicle = (payload: CreateVehicleDto) =>
    httpService.post<Vehicle, CreateVehicleDto>(VehicleURL, payload)
  static updateVehicle = (id: number, payload: UpdateVehicleDto) =>
    httpService.patch<Vehicle, UpdateVehicleDto>(`${VehicleURL}/${id}`, payload)
  static deactivateVehicle = (id: number) => httpService.delete<void>(`${VehicleURL}/${id}`)
}
