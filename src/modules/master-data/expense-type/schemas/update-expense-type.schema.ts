import { ExpenseTypeEnum, ProfitCategoryEnum } from '@/modules/master-data/master-data.enum'
import { expenseTypeFieldsSchema } from './create-expense-type.schema'
import z from 'zod'

export const updateExpenseTypeSchema = expenseTypeFieldsSchema.partial().extend({
  scope: z.nativeEnum(ExpenseTypeEnum).optional(),
  profit_category: z.nativeEnum(ProfitCategoryEnum).nullable().optional(),
  is_active: z.boolean().optional(),
})

export type UpdateExpenseTypeDto = z.infer<typeof updateExpenseTypeSchema>
