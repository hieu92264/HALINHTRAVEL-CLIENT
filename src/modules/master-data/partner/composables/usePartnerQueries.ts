import { PartnerService } from '@/services/partner.service'
import { useQuery } from '@tanstack/vue-query'

export const partnerQueryKeys = {
  all: ['partners'] as const,
}

export const usePartnerQuery = () => {
  return useQuery({
    queryKey: partnerQueryKeys.all,
    queryFn: PartnerService.getPartnerList,
    select: (data) => data,
  })
}
