import { vehicleQueryKeys } from './useVehicleQueries'
import type { UpdateVehicleDto } from '@/modules/master-data/vehicle/schemas/update-vehicle.schema'
import { VehicleService } from '@/services/vehicle.service'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

const invalidate = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: vehicleQueryKeys.all })

export const useStoreVehicleMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: VehicleService.storeVehicle, onSuccess: () => invalidate(queryClient) })
}

export const useUpdateVehicleMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: number; data: UpdateVehicleDto }) =>
      VehicleService.updateVehicle(payload.id, payload.data),
    onSuccess: () => invalidate(queryClient),
  })
}

export const useDeleteVehicleMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: VehicleService.deactivateVehicle, onSuccess: () => invalidate(queryClient) })
}
