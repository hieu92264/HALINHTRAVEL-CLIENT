import { PartnerService } from '@/services/partner.service'
import type { PartnerTypeEnum } from '@/modules/master-data/master-data.enum'
import { useQuery } from '@tanstack/vue-query'

export const partnerQueryKeys = {
  all: ['partners'] as const,
  options: (types: PartnerTypeEnum[] = []) => ['partners', 'options', ...types] as const,
}

export const usePartnerQuery = () => {
  return useQuery({
    queryKey: partnerQueryKeys.all,
    queryFn: PartnerService.getPartnerList,
    select: (data) => data,
  })
}

export const usePartnerOptionsQuery = (types: PartnerTypeEnum[] = []) => {
  return useQuery({
    queryKey: partnerQueryKeys.options(types),
    queryFn: () => PartnerService.getPartnerOptions(types),
    select: (data) => data,
  })
}
