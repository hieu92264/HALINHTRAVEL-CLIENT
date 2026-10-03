import { CustomerTypeEnum } from '@/modules/master-data/master-data.enum'
import { optionalNullableText } from '@/shared/helpers/zod.helper'
import z from 'zod'

const optionalNullableEmail = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value

    const normalized = value.trim()
    return normalized || null
  },
  z.string().email({ message: 'Email không hợp lệ' }).nullable().optional(),
)

export const openingBalanceSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string' || !value.trim()) return value
    return Number(value)
  },
  z.number().finite(),
)

export const customerFieldsSchema = z.object({
  type: z.nativeEnum(CustomerTypeEnum).default(CustomerTypeEnum.INDIVIDUAL),
  name: z.string().trim().min(1, { message: 'Tên khách hàng không được để trống' }),
  phone: optionalNullableText,
  email: optionalNullableEmail,
  cccd: optionalNullableText,
  tax_code: optionalNullableText,
  address: optionalNullableText,
  contact_name: optionalNullableText,
  opening_balance: openingBalanceSchema.default(0),
})

export const createCustomerSchema = customerFieldsSchema.superRefine((customer, context) => {
  if (customer.type === CustomerTypeEnum.INDIVIDUAL && !customer.cccd) {
    context.addIssue({
      code: 'custom',
      path: ['cccd'],
      message: 'CCCD là bắt buộc đối với khách hàng cá nhân',
    })
  }

  if (customer.type === CustomerTypeEnum.COMPANY && !customer.tax_code) {
    context.addIssue({
      code: 'custom',
      path: ['tax_code'],
      message: 'Mã số thuế là bắt buộc đối với khách hàng công ty',
    })
  }
})

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>
