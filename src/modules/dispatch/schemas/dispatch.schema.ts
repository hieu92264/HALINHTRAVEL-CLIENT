import z from 'zod'

export const assignmentSchema = z.object({
  vehicle_id: z.number().int().positive(),
  driver_id: z.number().int().positive(),
  replace_reason: z.string().max(500).nullable().optional(),
})

export const completionReportSchema = z.object({
  actual_end_at: z.string().min(1),
  end_odometer: z.number().int().min(0),
  actual_distance_km: z.string().regex(/^\d+(\.\d+)?$/).nullable().optional(),
  waiting_hours: z.string().regex(/^\d+(\.\d+)?$/).nullable().optional(),
  note: z.string().nullable().optional(),
})

export const startOrderSchema = z.object({
  actual_start_at: z.string().min(1),
  start_odometer: z.number().int().min(0),
  note: z.string().max(2000).nullable().optional(),
})

export const completionConfirmationSchema = z.object({
  customer_amount: z.string().regex(/^\d+(\.\d+)?$/),
  partner_vehicle_cost: z.string().regex(/^\d+(\.\d+)?$/).nullable().optional(),
  external_driver_cost: z.string().regex(/^\d+(\.\d+)?$/).nullable().optional(),
  note: z.string().nullable().optional(),
})

export const cancelOrderSchema = z.object({
  note: z.string().trim().min(1).max(2000),
})

export const scheduleCreateSchema = z.object({
  contract_id: z.number().int().positive({ message: 'Chọn hợp đồng.' }),
  contract_item_id: z.number().int().positive({ message: 'Chọn hạng mục dịch vụ.' }),
  scheduled_start_at: z.string().min(1, 'Nhập thời gian bắt đầu.'),
  scheduled_end_at: z.string().min(1, 'Nhập thời gian kết thúc.'),
  pickup_location: z.string().max(500).optional().default(''),
  dropoff_location: z.string().max(500).optional().default(''),
  note: z.string().max(2000).optional().default(''),
}).refine((data) => new Date(data.scheduled_end_at) > new Date(data.scheduled_start_at), {
  message: 'Thời gian kết thúc phải sau thời gian bắt đầu.',
  path: ['scheduled_end_at'],
})

export const scheduleUpdateSchema = z.object({
  scheduled_start_at: z.string().min(1, 'Nhập thời gian bắt đầu.'),
  scheduled_end_at: z.string().min(1, 'Nhập thời gian kết thúc.'),
  pickup_location: z.string().max(500).optional().default(''),
  dropoff_location: z.string().max(500).optional().default(''),
  note: z.string().max(2000).optional().default(''),
}).refine((data) => new Date(data.scheduled_end_at) > new Date(data.scheduled_start_at), {
  message: 'Thời gian kết thúc phải sau thời gian bắt đầu.',
  path: ['scheduled_end_at'],
})
