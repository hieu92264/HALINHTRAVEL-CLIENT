import { CustomerTypeEnum } from '@/modules/master-data/master-data.enum'
import { customerFieldsSchema, openingBalanceSchema } from './create-customer.schema'
import z from 'zod'

export const updateCustomerSchema = customerFieldsSchema
  .partial()
  .extend({
    type: z.nativeEnum(CustomerTypeEnum).optional(),
    opening_balance: openingBalanceSchema.optional(),
    is_active: z.boolean().optional(),
  })

export type UpdateCustomerDto = z.infer<typeof updateCustomerSchema>
