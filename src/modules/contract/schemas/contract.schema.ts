import type { ContractType, Weekday } from '@/modules/contract/contract.types'
import type { RentalServiceType } from '@/modules/rental/rental.types'
import z from 'zod'
const nullableText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() || null : value),
    z.string().max(max).nullable(),
  )
const money = z.coerce.number().min(0, 'Giá trị không được âm')
const effectiveDates = <T extends z.ZodRawShape>(shape: T) =>
  z.object(shape).superRefine((value, context) => {
    const dates = value as { effective_from?: string; effective_to?: string }
    if (dates.effective_to && dates.effective_from && dates.effective_to < dates.effective_from)
      context.addIssue({
        code: 'custom',
        path: ['effective_to'],
        message: 'Ngày kết thúc không được trước ngày bắt đầu',
      })
  })
const contractDates = <T extends z.ZodRawShape>(shape: T) =>
  effectiveDates(shape).superRefine((value, context) => {
    const dates = value as { signed_date?: string; effective_from?: string }
    if (!dates.signed_date)
      context.addIssue({ code: 'custom', path: ['signed_date'], message: 'Chọn ngày ký hợp đồng' })
    else if (dates.effective_from && dates.signed_date > dates.effective_from)
      context.addIssue({ code: 'custom', path: ['signed_date'], message: 'Ngày ký không được muộn hơn ngày hiệu lực' })
  })
const contractItem = z.object({
  route_id: z.coerce.number().nullable(),
  vehicle_type_id: z.coerce.number().int().positive(),
  service_type: z.custom<RentalServiceType>(),
  quantity: z.coerce.number().int().min(1),
  unit_price: money,
  driver_wage: money,
  pickup_location: nullableText(500),
  dropoff_location: nullableText(500),
  note: nullableText(65535),
})
export const contractFormSchema = contractDates({
  customer_id: z.coerce.number().int().positive('Chọn khách hàng'),
  contract_type: z.literal('principle'),
  signed_date: z.string(),
  effective_from: z.string().min(1),
  effective_to: z.string(),
  deposit_required: money,
  payment_terms: nullableText(65535),
  terms: nullableText(65535),
  items: z.array(contractItem).min(1),
}).superRefine((value, context) => {
  const total = value.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  if (value.deposit_required > total)
    context.addIssue({
      code: 'custom',
      path: ['deposit_required'],
      message: 'Đặt cọc không được lớn hơn tổng hợp đồng',
    })
})
export const contractFromQuotationSchema = contractDates({
  quotation_id: z.coerce.number().int().positive(),
  contract_type: z.literal('trip'),
  signed_date: z.string(),
  effective_from: z.string().min(1),
  effective_to: z.string(),
  deposit_required: money,
  payment_terms: nullableText(65535),
  terms: nullableText(65535),
})
const day = z.object({
  weekday: z.custom<Weekday>(),
  pickup_time: z.string().min(1),
  return_time: z.string(),
  shift_name: nullableText(100),
})
export const scheduleRuleSchema = effectiveDates({
  contract_item_id: z.coerce.number().int().positive(),
  route_id: z.coerce.number().nullable(),
  effective_from: z.string().min(1),
  effective_to: z.string().min(1),
  default_vehicle_id: z.coerce.number().nullable(),
  default_driver_id: z.coerce.number().nullable(),
  note: nullableText(65535),
  days: z.array(day).min(1),
}).superRefine((value, context) => {
  const seen = new Set<string>()
  value.days.forEach((item, index) => {
    const key = `${item.weekday}|${item.pickup_time}`
    if (seen.has(key))
      context.addIssue({
        code: 'custom',
        path: ['days', index, 'pickup_time'],
        message: 'Không được trùng thứ và giờ đón',
      })
    seen.add(key)
    if (item.return_time && item.return_time <= item.pickup_time)
      context.addIssue({
        code: 'custom',
        path: ['days', index, 'return_time'],
        message: 'Giờ về phải sau giờ đón',
      })
  })
})
export const generateScheduleSchema = z
  .object({ from_date: z.string().min(1), to_date: z.string().min(1) })
  .refine((value) => value.to_date >= value.from_date, {
    path: ['to_date'],
    message: 'Đến ngày không được trước từ ngày',
  })
