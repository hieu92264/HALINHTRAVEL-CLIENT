import { CustomerService } from '@/services/customer.service'
import { useQuery } from '@tanstack/vue-query'

export const customerQueryKeys = {
  all: ['customers'] as const,
}

export const useCustomerQuery = () => {
  return useQuery({
    queryKey: customerQueryKeys.all,
    queryFn: CustomerService.getCustomerList,
    select: (data) => data,
  })
}
