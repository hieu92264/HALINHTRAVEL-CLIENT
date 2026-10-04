import { partnerQueryKeys } from '@/modules/master-data/partner/composables/usePartnerQueries'
import type { UpdatePartnerDto } from '@/modules/master-data/partner/schemas/update-partner.schema'
import { PartnerService } from '@/services/partner.service'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

export const useStorePartnerMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: PartnerService.storePartner,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: partnerQueryKeys.all,
      })
    },
  })
}

export const useUpdatePartnerMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { id: number; data: UpdatePartnerDto }) =>
      PartnerService.updatePartner(payload.id, payload.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: partnerQueryKeys.all,
      })
    },
  })
}

export const useDeletePartnerMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => PartnerService.deactivePartner(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: partnerQueryKeys.all,
      })
    },
  })
}
