import type { RentalServiceType } from '@/modules/rental/rental.types'
import z from 'zod'

const nullableText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() || null : value),
    z.string().max(max).nullable(),
  )
const datetime = z.string().min(1, 'Trường này là bắt buộc')
const item = z.object({
  vehicle_type_id: z.coerce.number().int().positive('Chọn loại xe'),
  quantity: z.coerce.number().int().min(1, 'Số lượng tối thiểu là 1'),
  note: nullableText(65535),
})
export const rentalRequestFormSchema = z
  .object({
    customer_id: z.coerce.number().int().positive('Chọn khách hàng'),
    source: nullableText(30),
    requested_at: datetime,
    service_type: z.custom<RentalServiceType>(),
    start_at: datetime,
    end_at: z.string(),
    trip_mode: z.enum(['route', 'custom']),
    route_id: z.coerce.number(),
    pickup_location: nullableText(500),
    dropoff_location: nullableText(500),
    note: nullableText(65535),
    items: z.array(item).min(1, 'Cần ít nhất một hạng mục xe'),
  })
  .superRefine((value, context) => {
    if (value.end_at && value.end_at < value.start_at)
      context.addIssue({
        code: 'custom',
        path: ['end_at'],
        message: 'Kết thúc không được trước khởi hành',
      })
    if (value.trip_mode === 'route' && !value.route_id)
      context.addIssue({ code: 'custom', path: ['route_id'], message: 'Chọn tuyến xe' })
    if (value.trip_mode === 'custom') {
      if (!value.pickup_location)
        context.addIssue({ code: 'custom', path: ['pickup_location'], message: 'Nhập điểm đón' })
      if (!value.dropoff_location)
        context.addIssue({ code: 'custom', path: ['dropoff_location'], message: 'Nhập điểm trả' })
    }
  })
export type RentalRequestFormDto = z.infer<typeof rentalRequestFormSchema>
