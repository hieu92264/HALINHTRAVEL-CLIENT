import { CustomerService } from '@/services/customer.service'
import { useQuery } from '@tanstack/vue-query'

export const customerQueryKeys = {
  all: ['customers'] as const,
  options: ['customers', 'options'] as const,
}

export const useCustomerQuery = () => {
  return useQuery({
    queryKey: customerQueryKeys.all,
    queryFn: CustomerService.getCustomerList,
    select: (data) => data,
  })
}

export const useCustomerOptionsQuery = () => {
  return useQuery({
    queryKey: customerQueryKeys.options,
    queryFn: CustomerService.getCustomerList,
    select: (data) => data.map((customer) => ({ label: customer.name, value: customer.id })),
  })
}
