import { routeQueryKeys } from '@/modules/master-data/route/composables/useRouteQueries'
import type { UpdateRouteDto } from '@/modules/master-data/route/schemas/update-route.schema'
import { RouteService } from '@/services/route.service'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

export const useStoreRouteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: RouteService.storeRoute,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: routeQueryKeys.all,
      })
    },
  })
}

export const useUpdateRouteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { id: number; data: UpdateRouteDto }) =>
      RouteService.updateRoute(payload.id, payload.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: routeQueryKeys.all,
      })
    },
  })
}

export const useDeleteRouteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => RouteService.deactiveRoute(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: routeQueryKeys.all,
      })
    },
  })
}
