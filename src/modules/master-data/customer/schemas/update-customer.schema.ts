import { CustomerTypeEnum } from '@/modules/master-data/master-data.enum'
import { customerFieldsSchema, openingBalanceSchema } from './create-customer.schema'
import z from 'zod'

export const updateCustomerSchema = customerFieldsSchema
  .partial()
  .extend({
    type: z.nativeEnum(CustomerTypeEnum).optional(),
    opening_balance: openingBalanceSchema.optional(),
  })
  .refine((customer) => Object.values(customer).some((value) => value !== undefined), {
    message: 'Cần cập nhật ít nhất một thông tin khách hàng',
  })

export type UpdateCustomerDto = z.infer<typeof updateCustomerSchema>
