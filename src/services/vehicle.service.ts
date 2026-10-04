import type { Vehicle } from '@/modules/master-data/master-data.type'
import type { CreateVehicleDto } from '@/modules/master-data/vehicles/schemas/create-vehicle.schema'
import type { UpdateVehicleDto } from '@/modules/master-data/vehicles/schemas/update-vehicle.schema'
import { httpService } from '@/services/http.service'

export const VehicleURL = '/master-data/vehicles'

export class VehicleService {
  public static async getVehicleList(): Promise<Vehicle[]> {
    const response = await httpService.get<Vehicle[]>(VehicleURL)
    console.log('response', response)
    return response
  }

  public static async storeVehicle(payload: CreateVehicleDto): Promise<Vehicle> {
    const response = await httpService.post<Vehicle, CreateVehicleDto>(VehicleURL, payload)
    console.log('response', response)
    return response
  }

  public static async updateVehicle(id: number, payload: UpdateVehicleDto): Promise<Vehicle> {
    const response = await httpService.patch<Vehicle, UpdateVehicleDto>(
      VehicleURL + `/${id}`,
      payload,
    )
    console.log('response', response)
    return response
  }

  public static async deactiveVehicle(id: number): Promise<void> {
    const response = await httpService.delete<void>(VehicleURL + `/${id}`)
    console.log('response', response)
    return response
  }
}
