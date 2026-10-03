import { CustomerTypeEnum } from '@/modules/master-data/master-data.enum'
import { optionalNullableText } from '@/shared/helpers/zod.helper'
import z from 'zod'

const optionalNullableEmail = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value

    const normalized = value.trim()
    return normalized || null
  },
  z.email({ message: 'Email không hợp lệ' }).nullable().optional(),
)

export const createCustomerSchema = z.object({
  type: z.enum(CustomerTypeEnum).default(CustomerTypeEnum.INDIVIDUAL),
  name: z.string().trim().min(1, { message: 'Tên khách hàng không được để trống' }),
  phone: optionalNullableText,
  email: optionalNullableEmail,
  cccd: optionalNullableText,
  tax_code: optionalNullableText,
  address: optionalNullableText,
  contact_name: optionalNullableText,
  opening_balance: z.number().finite().default(0),
})

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>
