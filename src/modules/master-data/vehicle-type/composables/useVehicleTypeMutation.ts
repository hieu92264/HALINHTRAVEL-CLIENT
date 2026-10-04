import { vehicleTypeQueryKeys } from '@/modules/master-data/vehicle-type/composables/useVehicleTypeQueries'
import type { UpdateVehicleTypeDto } from '@/modules/master-data/vehicle-type/schemas/update-vehicle-type.schema'
import { VehicleTypeService } from '@/services/vehicle-type.service'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

export const useStoreVehicleTypeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: VehicleTypeService.storeVehicleType,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vehicleTypeQueryKeys.all,
      })
    },
  })
}

export const useUpdateVehicleTypeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { id: number; data: UpdateVehicleTypeDto }) =>
      VehicleTypeService.updateVehicleType(payload.id, payload.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vehicleTypeQueryKeys.all,
      })
    },
  })
}

export const useDeleteVehicleTypeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => VehicleTypeService.deactiveVehicleType(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: vehicleTypeQueryKeys.all,
      })
    },
  })
}
