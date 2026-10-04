import { PartnerTypeEnum } from '@/modules/master-data/master-data.enum'
import z from 'zod'

const nullableText = (maxLength: number, label: string) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value

      return value.trim() || null
    },
    z.string().max(maxLength, { message: `${label} không được vượt quá ${maxLength} ký tự` }).nullable(),
  )

const nullableEmail = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value

    return value.trim() || null
  },
  z
    .string()
    .email({ message: 'Email không hợp lệ' })
    .max(255, { message: 'Email không được vượt quá 255 ký tự' })
    .nullable(),
)

export const openingBalanceSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string' || !value.trim()) return value

    return Number(value)
  },
  z
    .number()
    .finite({ message: 'Công nợ đầu kỳ phải là số hợp lệ' })
    .refine((value) => Number.isInteger(value * 100), {
      message: 'Công nợ đầu kỳ chỉ được có tối đa 2 chữ số thập phân',
    }),
)

export const partnerFieldsSchema = z.object({
  type: z.nativeEnum(PartnerTypeEnum).default(PartnerTypeEnum.OTHER),
  name: z
    .string()
    .trim()
    .min(1, { message: 'Tên đối tác không được để trống' })
    .max(255, { message: 'Tên đối tác không được vượt quá 255 ký tự' }),
  phone: nullableText(20, 'Số điện thoại'),
  email: nullableEmail,
  cccd: nullableText(20, 'CCCD'),
  tax_code: nullableText(30, 'Mã số thuế'),
  address: nullableText(500, 'Địa chỉ'),
  bank_name: nullableText(255, 'Tên ngân hàng'),
  bank_account: nullableText(100, 'Số tài khoản'),
  opening_balance: openingBalanceSchema.default(0),
})

export const createPartnerSchema = partnerFieldsSchema

export type CreatePartnerDto = z.infer<typeof createPartnerSchema>
