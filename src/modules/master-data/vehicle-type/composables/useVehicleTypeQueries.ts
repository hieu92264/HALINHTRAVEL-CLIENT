import { VehicleTypeService } from '@/services/vehicle-type.service'
import { useQuery } from '@tanstack/vue-query'

export const vehicleTypeQueryKeys = {
  all: ['vehicle-types'] as const,
}

export const useVehicleTypeQuery = () => {
  return useQuery({
    queryKey: vehicleTypeQueryKeys.all,
    queryFn: VehicleTypeService.getVehicleTypeList,
    select: (data) => data,
  })
}
