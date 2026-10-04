import { DriverService } from '@/services/driver.service'
import { useQuery } from '@tanstack/vue-query'

export const driverQueryKeys = {
  all: ['drivers'] as const,
}

export const useDriverQuery = () => {
  return useQuery({
    queryKey: driverQueryKeys.all,
    queryFn: DriverService.getDriverList,
    select: (data) => data,
  })
}
