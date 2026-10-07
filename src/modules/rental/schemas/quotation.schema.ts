import z from 'zod'
const nullableText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() || null : value),
    z.string().max(max).nullable(),
  )
const money = z.coerce.number().min(0, 'Giá trị không được âm')
export const quotationFormSchema = z
  .object({
    customer_id: z.coerce.number().int().positive('Chọn khách hàng'),
    rental_request_id: z.coerce.number().nullable(),
    quotation_date: z.string().min(1, 'Chọn ngày báo giá'),
    valid_until: z.string(),
    discount_amount: money,
    payment_terms: nullableText(65535),
    items: z
      .array(
        z.object({
          vehicle_type_id: z.coerce.number().int().positive('Chọn loại xe'),
          route_id: z.coerce.number().nullable(),
          description: nullableText(500),
          quantity: z.coerce.number().int().min(1),
          unit_price: money,
        }),
      )
      .min(1),
  })
  .superRefine((value, context) => {
    if (value.valid_until && value.valid_until < value.quotation_date)
      context.addIssue({
        code: 'custom',
        path: ['valid_until'],
        message: 'Hiệu lực không được trước ngày báo giá',
      })
  })
export type QuotationFormDto = z.infer<typeof quotationFormSchema>
