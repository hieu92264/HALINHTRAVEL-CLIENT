import type { VehicleType } from '@/modules/master-data/master-data.type'
import type { CreateVehicleTypeDto } from '@/modules/master-data/vehicle-type/schemas/create-vehicle-type.schema'
import type { UpdateVehicleTypeDto } from '@/modules/master-data/vehicle-type/schemas/update-vehicle-type.schema'
import { httpService } from '@/services/http.service'

export const VehicleTypeURL = '/master-data/vehicle-types'

export class VehicleTypeService {
  public static async getVehicleTypeList(): Promise<VehicleType[]> {
    const response = await httpService.get<VehicleType[]>(VehicleTypeURL)
    console.log('response', response)
    return response
  }

  public static async storeVehicleType(payload: CreateVehicleTypeDto): Promise<VehicleType> {
    const response = await httpService.post<VehicleType, CreateVehicleTypeDto>(
      VehicleTypeURL,
      payload,
    )
    console.log('response', response)
    return response
  }

  public static async updateVehicleType(
    id: number,
    payload: UpdateVehicleTypeDto,
  ): Promise<VehicleType> {
    const response = await httpService.patch<VehicleType, UpdateVehicleTypeDto>(
      VehicleTypeURL + `/${id}`,
      payload,
    )
    console.log('response', response)
    return response
  }

  public static async deactiveVehicleType(id: number): Promise<void> {
    const response = await httpService.delete<void>(VehicleTypeURL + `/${id}`)
    console.log('response', response)
    return response
  }
}
