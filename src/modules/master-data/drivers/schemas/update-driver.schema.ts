import { OwnershipTypeEnum } from '@/modules/master-data/master-data.enum'
import { driverFieldsSchema } from './create-driver.schema'
import z from 'zod'

export const updateDriverSchema = driverFieldsSchema
  .partial()
  .extend({
    base_salary: z.preprocess(
      (value) => (typeof value === 'string' && value.trim() ? Number(value) : value),
      z
        .number()
        .finite({ message: 'Lương cơ bản phải là số hợp lệ' })
        .min(0, { message: 'Lương cơ bản không được nhỏ hơn 0' })
        .refine((value) => Number.isInteger(value * 100), {
          message: 'Lương cơ bản chỉ được có tối đa 2 chữ số thập phân',
        })
        .optional(),
    ),
    responsibility_allowance: z.preprocess(
      (value) => (typeof value === 'string' && value.trim() ? Number(value) : value),
      z
        .number()
        .finite({ message: 'Phụ cấp trách nhiệm phải là số hợp lệ' })
        .min(0, { message: 'Phụ cấp trách nhiệm không được nhỏ hơn 0' })
        .refine((value) => Number.isInteger(value * 100), {
          message: 'Phụ cấp trách nhiệm chỉ được có tối đa 2 chữ số thập phân',
        })
        .optional(),
    ),
    is_active: z.boolean().optional(),
  })
  .superRefine((driver, context) => {
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
  })
  .transform((driver) => {
    if (driver.type === OwnershipTypeEnum.COMPANY) {
      return { ...driver, partner_id: null }
    }

    return driver
  })

export type UpdateDriverDto = z.infer<typeof updateDriverSchema>
