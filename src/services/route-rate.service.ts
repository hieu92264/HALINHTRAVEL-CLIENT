import type { RouteRate } from '@/modules/master-data/master-data.type'
import type { CreateRouteRateDto } from '@/modules/master-data/route-rate/schemas/create-route-rate.schema'
import type { UpdateRouteRateDto } from '@/modules/master-data/route-rate/schemas/update-route-rate.schema'
import { httpService } from '@/services/http.service'

export const RouteRateURL = '/master-data/route-rates'

export class RouteRateService {
  public static async getRouteRateList(): Promise<RouteRate[]> {
    const response = await httpService.get<RouteRate[]>(RouteRateURL)
    console.log('response', response)
    return response
  }

  public static async lookupRouteRateList(): Promise<RouteRate[]> {
    const response = await httpService.get<RouteRate[]>(RouteRateURL + '/lookup')
    console.log('response', response)
    return response
  }

  public static async storeRouteRate(payload: CreateRouteRateDto): Promise<RouteRate> {
    const response = await httpService.post<RouteRate, CreateRouteRateDto>(RouteRateURL, payload)
    console.log('response', response)
    return response
  }

  public static async updateRouteRate(id: number, payload: UpdateRouteRateDto): Promise<RouteRate> {
    const response = await httpService.patch<RouteRate, UpdateRouteRateDto>(
      RouteRateURL + `/${id}`,
      payload,
    )
    console.log('response', response)
    return response
  }

  public static async deactiveRouteRate(id: number): Promise<void> {
    const response = await httpService.delete<void>(RouteRateURL + `/${id}`)
    console.log('response', response)
    return response
  }
}
