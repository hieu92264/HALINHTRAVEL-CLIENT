import z from 'zod'

export const assignmentSchema = z.object({
  vehicle_id: z.number().int().positive(),
  driver_id: z.number().int().positive(),
  replace_reason: z.string().max(500).nullable().optional(),
})

export const completionReportSchema = z.object({
  actual_start_at: z.string().min(1),
  actual_end_at: z.string().min(1),
  start_odometer: z.number().int().min(0),
  end_odometer: z.number().int().min(0),
  actual_distance_km: z.number().min(0).optional(),
  waiting_hours: z.number().min(0).optional(),
  note: z.string().nullable().optional(),
}).refine((value) => value.end_odometer >= value.start_odometer, { path: ['end_odometer'], message: 'ODO kết thúc không được nhỏ hơn ODO bắt đầu.' })

export const completionConfirmationSchema = z.object({
  customer_amount: z.number().min(0),
  partner_vehicle_cost: z.number().min(0).optional(),
  external_driver_cost: z.number().min(0).optional(),
  note: z.string().nullable().optional(),
})
