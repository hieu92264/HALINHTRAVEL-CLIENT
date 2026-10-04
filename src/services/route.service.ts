import type { Route } from '@/modules/master-data/master-data.type'
import type { CreateRouteDto } from '@/modules/master-data/route/schemas/create-route.schema'
import type { UpdateRouteDto } from '@/modules/master-data/route/schemas/update-route.schema'
import { httpService } from '@/services/http.service'

export const RouteURL = '/master-data/routes'

export class RouteService {
  public static async getRouteList(): Promise<Route[]> {
    const response = await httpService.get<Route[]>(RouteURL)
    console.log('response', response)
    return response
  }

  public static async storeRoute(payload: CreateRouteDto): Promise<Route> {
    const response = await httpService.post<Route, CreateRouteDto>(RouteURL, payload)
    console.log('response', response)
    return response
  }

  public static async updateRoute(id: number, payload: UpdateRouteDto): Promise<Route> {
    const response = await httpService.patch<Route, UpdateRouteDto>(RouteURL + `/${id}`, payload)
    console.log('response', response)
    return response
  }

  public static async deactiveRoute(id: number): Promise<void> {
    const response = await httpService.delete<void>(RouteURL + `/${id}`)
    console.log('response', response)
    return response
  }
}
