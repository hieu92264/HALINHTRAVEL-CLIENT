import z from 'zod'

const nullableDate = (label: string) =>
  z.preprocess(
    (value) => typeof value === 'string' && !value.trim() ? null : value,
    z.string().date(`${label} không hợp lệ`).nullable().optional(),
  )

export const driverFieldsSchema = z.object({
  full_name: z.string().trim().min(1, { message: 'Họ và tên không được để trống' }).max(255),
  phone: z.preprocess(
    (value) => typeof value === 'string' && !value.trim() ? null : value,
    z.string().max(20).nullable().optional(),
  ),
  responsibility_allowance: z.preprocess(
    (value) => typeof value === 'string' && value.trim() ? Number(value) : value,
    z.number().finite({ message: 'Phụ cấp trách nhiệm phải là số hợp lệ' }).min(0).default(0),
  ),
  joined_at: nullableDate('Ngày vào làm'),
  left_at: nullableDate('Ngày nghỉ việc'),
})

export const createDriverSchema = driverFieldsSchema.superRefine((driver, context) => {
  if (driver.joined_at && driver.left_at && driver.left_at < driver.joined_at) {
    context.addIssue({ code: 'custom', path: ['left_at'], message: 'Ngày nghỉ việc phải bằng hoặc sau ngày vào làm' })
  }
})

export type CreateDriverDto = z.infer<typeof createDriverSchema>
