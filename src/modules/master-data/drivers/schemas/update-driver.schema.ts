import z from 'zod'
import { driverFieldsSchema } from './create-driver.schema'

export const updateDriverSchema = driverFieldsSchema.partial().extend({
  is_active: z.boolean().optional(),
}).superRefine((driver, context) => {
  if (driver.joined_at && driver.left_at && driver.left_at < driver.joined_at) {
    context.addIssue({ code: 'custom', path: ['left_at'], message: 'Ngày nghỉ việc phải bằng hoặc sau ngày vào làm' })
  }
})

export type UpdateDriverDto = z.infer<typeof updateDriverSchema>
