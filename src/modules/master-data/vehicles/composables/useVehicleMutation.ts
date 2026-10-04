import { vehicleQueryKeys } from '@/modules/master-data/vehicles/composables/useVehicleQueries'
import type { UpdateVehicleDto } from '@/modules/master-data/vehicles/schemas/update-vehicle.schema'
import { VehicleService } from '@/services/vehicle.service'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

export const useStoreVehicleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: VehicleService.storeVehicle,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vehicleQueryKeys.all,
      })
    },
  })
}

export const useUpdateVehicleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { id: number; data: UpdateVehicleDto }) =>
      VehicleService.updateVehicle(payload.id, payload.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vehicleQueryKeys.all,
      })
    },
  })
}

export const useDeleteVehicleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => VehicleService.deactiveVehicle(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vehicleQueryKeys.all,
      })
    },
  })
}
