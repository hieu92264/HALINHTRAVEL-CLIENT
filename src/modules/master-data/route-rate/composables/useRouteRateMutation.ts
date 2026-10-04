import { routeRateQueryKeys } from '@/modules/master-data/route-rate/composables/useRouteRateQueries'
import type { UpdateRouteRateDto } from '@/modules/master-data/route-rate/schemas/update-route-rate.schema'
import { RouteRateService } from '@/services/route-rate.service'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

export const useStoreRouteRateMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: RouteRateService.storeRouteRate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: routeRateQueryKeys.all,
      })
    },
  })
}

export const useUpdateRouteRateMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { id: number; data: UpdateRouteRateDto }) =>
      RouteRateService.updateRouteRate(payload.id, payload.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: routeRateQueryKeys.all,
      })
    },
  })
}

export const useDeleteRouteRateMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => RouteRateService.deactiveRouteRate(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: routeRateQueryKeys.all,
      })
    },
  })
}
