import { PartnerService } from '@/services/partner.service'
import { useQuery } from '@tanstack/vue-query'

export const partnerQueryKeys = {
  all: ['partners'] as const,
  options: ['partners', 'options'] as const,
}

export const usePartnerQuery = () => {
  return useQuery({
    queryKey: partnerQueryKeys.all,
    queryFn: PartnerService.getPartnerList,
    select: (data) => data,
  })
}

export const usePartnerOptionsQuery = () => {
  return useQuery({
    queryKey: partnerQueryKeys.options,
    queryFn: PartnerService.getPartnerOptions,
    select: (data) => data,
  })
}
