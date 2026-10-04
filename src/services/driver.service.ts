import type { Driver } from '@/modules/master-data/master-data.type'
import type { CreateDriverDto } from '@/modules/master-data/drivers/schemas/create-driver.schema'
import type { UpdateDriverDto } from '@/modules/master-data/drivers/schemas/update-driver.schema'
import { httpService } from '@/services/http.service'

export const DriverURL = '/master-data/drivers'

export class DriverService {
  public static async getDriverList(): Promise<Driver[]> {
    const response = await httpService.get<Driver[]>(DriverURL)
    console.log('response', response)
    return response
  }

  public static async storeDriver(payload: CreateDriverDto): Promise<Driver> {
    const response = await httpService.post<Driver, CreateDriverDto>(DriverURL, payload)
    console.log('response', response)
    return response
  }

  public static async updateDriver(id: number, payload: UpdateDriverDto): Promise<Driver> {
    const response = await httpService.patch<Driver, UpdateDriverDto>(DriverURL + `/${id}`, payload)
    console.log('response', response)
    return response
  }

  public static async deactiveDriver(id: number): Promise<void> {
    const response = await httpService.delete<void>(DriverURL + `/${id}`)
    console.log('response', response)
    return response
  }
}
