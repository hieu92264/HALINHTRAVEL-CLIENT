import { OwnershipTypeEnum } from '@/modules/master-data/master-data.enum'
import z from 'zod'

const nullableText = (maxLength?: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value

      return value.trim() || null
    },
    maxLength === undefined
      ? z.string().nullable().optional()
      : z.string().max(maxLength, { message: `Không được vượt quá ${maxLength} ký tự` }).nullable().optional(),
  )

const nullableInteger = (label: string) =>
  z.preprocess(
    (value) => {
      if (typeof value === 'string') return value.trim() ? Number(value) : null
      return value
    },
    z
      .number()
      .finite({ message: `${label} phải là số hợp lệ` })
      .int({ message: `${label} phải là số nguyên` })
      .nullable()
      .optional(),
  )

const nullableDate = (label: string) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value

      return value.trim() || null
    },
    z.string().date(`${label} không hợp lệ`).nullable().optional(),
  )

export const salarySchema = (label: string) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string' || !value.trim()) return value

      return Number(value)
    },
    z
      .number()
      .finite({ message: `${label} phải là số hợp lệ` })
      .min(0, { message: `${label} không được nhỏ hơn 0` })
      .refine((value) => Number.isInteger(value * 100), {
        message: `${label} chỉ được có tối đa 2 chữ số thập phân`,
      }),
  )

export const driverFieldsSchema = z.object({
  user_name: nullableText(100),
  partner_id: nullableInteger('Đối tác'),
  type: z.nativeEnum(OwnershipTypeEnum),
  full_name: z
    .string()
    .trim()
    .min(1, { message: 'Họ và tên không được để trống' })
    .max(255, { message: 'Họ và tên không được vượt quá 255 ký tự' }),
  phone: nullableText(20),
  cccd: nullableText(20),
  license_number: z
    .string()
    .trim()
    .min(1, { message: 'Số bằng lái không được để trống' })
    .max(50, { message: 'Số bằng lái không được vượt quá 50 ký tự' }),
  license_class: z
    .string()
    .trim()
    .min(1, { message: 'Hạng bằng lái không được để trống' })
    .max(20, { message: 'Hạng bằng lái không được vượt quá 20 ký tự' }),
  license_issued_at: nullableDate('Ngày cấp bằng lái'),
  license_expired_at: nullableDate('Ngày hết hạn bằng lái'),
  base_salary: salarySchema('Lương cơ bản').default(0),
  responsibility_allowance: salarySchema('Phụ cấp trách nhiệm').default(0),
  joined_at: nullableDate('Ngày vào làm'),
  left_at: nullableDate('Ngày nghỉ việc'),
})

const validateDateOrder = (driver: z.infer<typeof driverFieldsSchema>, context: z.RefinementCtx) => {
  if (
    driver.license_issued_at &&
    driver.license_expired_at &&
    driver.license_expired_at < driver.license_issued_at
  ) {
    context.addIssue({
      code: 'custom',
      path: ['license_expired_at'],
      message: 'Ngày hết hạn bằng lái phải bằng hoặc sau ngày cấp bằng lái',
    })
  }

  if (driver.joined_at && driver.left_at && driver.left_at < driver.joined_at) {
    context.addIssue({
      code: 'custom',
      path: ['left_at'],
      message: 'Ngày nghỉ việc phải bằng hoặc sau ngày vào làm',
    })
  }
}

export const createDriverSchema = driverFieldsSchema
  .superRefine((driver, context) => {
    if (driver.type === OwnershipTypeEnum.INDIVIDUAL && driver.partner_id == null) {
      context.addIssue({
        code: 'custom',
        path: ['partner_id'],
        message: 'Đối tác là bắt buộc khi loại tài xế là đối tác',
      })
    }

    validateDateOrder(driver, context)
  })
  .transform((driver) => {
    if (driver.type === OwnershipTypeEnum.COMPANY) {
      return { ...driver, partner_id: null }
    }

    return driver
  })

export type CreateDriverDto = z.infer<typeof createDriverSchema>
