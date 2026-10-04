import { ExpenseTypeService } from '@/services/expense-type.service'
import { useQuery } from '@tanstack/vue-query'

export const expenseTypeQueryKeys = {
  all: ['expense-types'] as const,
}

export const useExpenseTypeQuery = () => {
  return useQuery({
    queryKey: expenseTypeQueryKeys.all,
    queryFn: ExpenseTypeService.getExpenseTypeList,
    select: (data) => data,
  })
}
