import { CustomerTypeEnum } from '@/modules/master-data/master-data.enum'
import z from 'zod'

const nullableText = (maxLength: number, label: string) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value

      return value.trim() || null
    },
    z.string().max(maxLength, { message: `${label} không được vượt quá ${maxLength} ký tự` }).nullable().optional(),
  )

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
  z
    .number()
    .finite({ message: 'Số dư đầu kỳ phải là số hợp lệ' })
    .refine((value) => Number.isInteger(value * 100), {
      message: 'Số dư đầu kỳ chỉ được có tối đa 2 chữ số thập phân',
    }),
)

export const customerFieldsSchema = z.object({
  type: z.nativeEnum(CustomerTypeEnum).default(CustomerTypeEnum.INDIVIDUAL),
  name: z
    .string()
    .trim()
    .min(1, { message: 'Tên khách hàng không được để trống' })
    .max(255, { message: 'Tên khách hàng không được vượt quá 255 ký tự' }),
  phone: nullableText(20, 'Số điện thoại'),
  email: optionalNullableEmail,
  cccd: nullableText(20, 'CCCD'),
  tax_code: nullableText(30, 'Mã số thuế'),
  address: nullableText(500, 'Địa chỉ'),
  contact_name: nullableText(255, 'Tên người liên hệ'),
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
