import { VehicleService } from '@/services/vehicle.service'
import { useQuery } from '@tanstack/vue-query'

export const vehicleQueryKeys = {
  all: ['vehicles'] as const,
}

export const useVehicleQuery = () => {
  return useQuery({
    queryKey: vehicleQueryKeys.all,
    queryFn: VehicleService.getVehicleList,
    select: (data) => data,
  })
}
