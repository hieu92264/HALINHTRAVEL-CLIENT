import { VehicleTypeService } from '@/services/vehicle-type.service'
import { useQuery } from '@tanstack/vue-query'

export const vehicleTypeQueryKeys = {
  all: ['vehicle-types'] as const,
  options: ['vehicle-types', 'options'] as const,
}

export const useVehicleTypeQuery = () => {
  return useQuery({
    queryKey: vehicleTypeQueryKeys.all,
    queryFn: VehicleTypeService.getVehicleTypeList,
    select: (data) => data,
  })
}

export const useVehicleTypeOptionsQuery = () => {
  return useQuery({
    queryKey: vehicleTypeQueryKeys.options,
    queryFn: VehicleTypeService.getVehicleTypeOptions,
    select: (data) => data,
  })
}
