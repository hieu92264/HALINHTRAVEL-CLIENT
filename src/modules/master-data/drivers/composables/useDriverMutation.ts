import { driverQueryKeys } from '@/modules/master-data/drivers/composables/useDriverQueries'
import type { UpdateDriverDto } from '@/modules/master-data/drivers/schemas/update-driver.schema'
import { DriverService } from '@/services/driver.service'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

export const useStoreDriverMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: DriverService.storeDriver,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: driverQueryKeys.all,
      })
    },
  })
}

export const useUpdateDriverMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { id: number; data: UpdateDriverDto }) =>
      DriverService.updateDriver(payload.id, payload.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: driverQueryKeys.all,
      })
    },
  })
}

export const useDeleteDriverMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => DriverService.deactiveDriver(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: driverQueryKeys.all,
      })
    },
  })
}
