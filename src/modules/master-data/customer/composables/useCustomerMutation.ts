import { customerQueryKeys } from '@/modules/master-data/customer/composables/useCustomerQueries'
import type { UpdateCustomerDto } from '@/modules/master-data/customer/schemas/update-customer.schema'
import { CustomerService } from '@/services/customer.service'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

export const useStoreCustomerMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: CustomerService.storeCustomer,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [customerQueryKeys.all],
      })
    },
  })
}

export const useUpdateCustomerMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: number; data: UpdateCustomerDto }) =>
      CustomerService.updateCustomer(payload.id, payload.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [customerQueryKeys.all],
      })
    },
  })
}

export const useDeleteCustomerMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => CustomerService.deactiveCustomer(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [customerQueryKeys.all],
      })
    },
  })
}
