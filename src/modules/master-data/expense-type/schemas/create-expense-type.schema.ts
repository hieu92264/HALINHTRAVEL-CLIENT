import { ExpenseTypeEnum } from '@/modules/master-data/master-data.enum'
import z from 'zod'

export const expenseTypeFieldsSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, { message: 'Mã loại chi phí không được để trống' })
    .max(50, { message: 'Mã loại chi phí không được vượt quá 50 ký tự' }),
  name: z
    .string()
    .trim()
    .min(1, { message: 'Tên loại chi phí không được để trống' })
    .max(150, { message: 'Tên loại chi phí không được vượt quá 150 ký tự' }),
  scope: z.nativeEnum(ExpenseTypeEnum),
})

export const createExpenseTypeSchema = expenseTypeFieldsSchema

export type CreateExpenseTypeDto = z.infer<typeof createExpenseTypeSchema>
