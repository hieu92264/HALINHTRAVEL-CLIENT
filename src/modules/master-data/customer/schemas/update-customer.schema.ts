import { CustomerTypeEnum } from '@/modules/master-data/master-data.enum'
import { createCustomerSchema } from './create-customer.schema'
import z from 'zod'

export const updateCustomerSchema = createCustomerSchema
  .partial()
  .extend({
    type: z.enum(CustomerTypeEnum).optional(),
    opening_balance: z.number().finite().optional(),
  })
  .refine((customer) => Object.values(customer).some((value) => value !== undefined), {
    message: 'Cần cập nhật ít nhất một thông tin khách hàng',
  })

export type UpdateCustomerDto = z.infer<typeof updateCustomerSchema>
