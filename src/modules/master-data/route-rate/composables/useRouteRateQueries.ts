import { RouteRateService } from '@/services/route-rate.service'
import { useQuery } from '@tanstack/vue-query'

export const routeRateQueryKeys = {
  all: ['route-rates'] as const,
  lookup: ['route-rates', 'lookup'] as const,
}

export const useRouteRateQuery = () => {
  return useQuery({
    queryKey: routeRateQueryKeys.all,
    queryFn: RouteRateService.getRouteRateList,
    select: (data) => data,
  })
}

export const useRouteRateLookupQuery = () => {
  return useQuery({
    queryKey: routeRateQueryKeys.lookup,
    queryFn: RouteRateService.lookupRouteRateList,
    select: (data) => data,
  })
}
