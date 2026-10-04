import z from 'zod'

const nullableText = (maxLength: number, label: string) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value

      return value.trim() || null
    },
    z.string().max(maxLength, { message: `${label} không được vượt quá ${maxLength} ký tự` }).nullable(),
  )

const numberInput = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value

      const normalized = value.trim()
      return normalized ? Number(normalized) : null
    },
    schema,
  )

export const customerIdSchema = numberInput(
  z
    .number()
    .finite({ message: 'Khách hàng phải là số hợp lệ' })
    .int({ message: 'Khách hàng phải là số nguyên' })
    .nullable(),
)

export const timeSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value

    return value.trim() || null
  },
  z
    .string()
    .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, { message: 'Giờ phải theo định dạng HH:mm' })
    .nullable(),
)

export const estimatedDistanceKmSchema = numberInput(
  z
    .number()
    .finite({ message: 'Khoảng cách ước tính phải là số hợp lệ' })
    .min(0, { message: 'Khoảng cách ước tính không được nhỏ hơn 0' })
    .refine((value) => Number.isInteger(value * 100), {
      message: 'Khoảng cách ước tính chỉ được có tối đa 2 chữ số thập phân',
    })
    .nullable(),
)

export const routeFieldsSchema = z.object({
  customer_id: customerIdSchema.optional(),
  name: z
    .string()
    .trim()
    .min(1, { message: 'Tên tuyến không được để trống' })
    .max(255, { message: 'Tên tuyến không được vượt quá 255 ký tự' }),
  shift_name: nullableText(100, 'Tên ca').optional(),
  pickup_location: z
    .string()
    .trim()
    .min(1, { message: 'Điểm đón không được để trống' })
    .max(500, { message: 'Điểm đón không được vượt quá 500 ký tự' }),
  dropoff_location: z
    .string()
    .trim()
    .min(1, { message: 'Điểm trả không được để trống' })
    .max(500, { message: 'Điểm trả không được vượt quá 500 ký tự' }),
  default_pickup_time: timeSchema.optional(),
  default_return_time: timeSchema.optional(),
  estimated_distance_km: estimatedDistanceKmSchema.optional(),
})

export const createRouteSchema = routeFieldsSchema

export type CreateRouteDto = z.infer<typeof createRouteSchema>
