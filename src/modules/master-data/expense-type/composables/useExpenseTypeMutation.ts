import { expenseTypeQueryKeys } from '@/modules/master-data/expense-type/composables/useExpenseTypeQueries'
import type { UpdateExpenseTypeDto } from '@/modules/master-data/expense-type/schemas/update-expense-type.schema'
import { ExpenseTypeService } from '@/services/expense-type.service'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

export const useStoreExpenseTypeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ExpenseTypeService.storeExpenseType,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: expenseTypeQueryKeys.all,
      })
    },
  })
}

export const useUpdateExpenseTypeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { id: number; data: UpdateExpenseTypeDto }) =>
      ExpenseTypeService.updateExpenseType(payload.id, payload.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: expenseTypeQueryKeys.all,
      })
    },
  })
}

export const useDeleteExpenseTypeMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => ExpenseTypeService.deactiveExpenseType(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: expenseTypeQueryKeys.all,
      })
    },
  })
}
