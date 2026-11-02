import { VehicleService } from '@/services/vehicle.service'
import type { OwnershipTypeEnum } from '@/modules/master-data/master-data.enum'
import { useQuery } from '@tanstack/vue-query'

export const vehicleQueryKeys = {
  all: ['vehicles'] as const,
  options: (ownershipType?: OwnershipTypeEnum) => ['vehicles', 'options', ownershipType] as const,
}

export const useVehicleQuery = () =>
  useQuery({ queryKey: vehicleQueryKeys.all, queryFn: VehicleService.getVehicleList })

export const useVehicleOptionsQuery = (ownershipType?: OwnershipTypeEnum) =>
  useQuery({
    queryKey: vehicleQueryKeys.options(ownershipType),
    queryFn: () => VehicleService.getVehicleOptions(ownershipType),
  })
