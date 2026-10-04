import { RouteService } from '@/services/route.service'
import { useQuery } from '@tanstack/vue-query'

export const routeQueryKeys = {
  all: ['routes'] as const,
}

export const useRouteQuery = () => {
  return useQuery({
    queryKey: routeQueryKeys.all,
    queryFn: RouteService.getRouteList,
    select: (data) => data,
  })
}
