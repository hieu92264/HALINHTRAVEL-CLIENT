import z from 'zod'

const numberInput = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string' || !value.trim()) return value

      return Number(value)
    },
    schema,
  )

export const routeRateIdSchema = (label: string) =>
  numberInput(
    z
      .number()
      .finite({ message: `${label} phải là số hợp lệ` })
      .int({ message: `${label} phải là số nguyên` }),
  )

export const moneySchema = (label: string) =>
  numberInput(
    z
      .number()
      .finite({ message: `${label} phải là số hợp lệ` })
      .min(0, { message: `${label} không được nhỏ hơn 0` })
      .refine((value) => Number.isInteger(value * 100), {
        message: `${label} chỉ được có tối đa 2 chữ số thập phân`,
      }),
  )

export const dateSchema = (label: string) =>
  z.string().date(`${label} không hợp lệ`)

export const nullableDateSchema = (label: string) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value

      return value.trim() || null
    },
    dateSchema(label).nullable().optional(),
  )

export const routeRateFieldsSchema = z.object({
  route_id: routeRateIdSchema('Tuyến đường'),
  vehicle_type_id: routeRateIdSchema('Loại xe'),
  customer_price: moneySchema('Giá khách hàng'),
  driver_wage: moneySchema('Lương tài xế').default(0),
  effective_from: dateSchema('Ngày bắt đầu hiệu lực'),
  effective_to: nullableDateSchema('Ngày kết thúc hiệu lực'),
})

export const createRouteRateSchema = routeRateFieldsSchema.superRefine((routeRate, context) => {
  if (routeRate.effective_to && routeRate.effective_to < routeRate.effective_from) {
    context.addIssue({
      code: 'custom',
      path: ['effective_to'],
      message: 'Ngày kết thúc hiệu lực phải sau hoặc bằng ngày bắt đầu hiệu lực',
    })
  }
})

export type CreateRouteRateDto = z.infer<typeof createRouteRateSchema>
