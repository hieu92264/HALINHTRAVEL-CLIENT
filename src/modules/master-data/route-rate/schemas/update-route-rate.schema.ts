import {
  moneySchema,
  nullableDateSchema,
  routeRateFieldsSchema,
} from './create-route-rate.schema'
import z from 'zod'

export const updateRouteRateSchema = routeRateFieldsSchema
  .partial()
  .extend({
    driver_wage: moneySchema('Lương tài xế').optional(),
    effective_to: nullableDateSchema('Ngày kết thúc hiệu lực').optional(),
    is_active: z.boolean().optional(),
  })
  .superRefine((routeRate, context) => {
    if (
      routeRate.effective_from &&
      routeRate.effective_to &&
      routeRate.effective_to < routeRate.effective_from
    ) {
      context.addIssue({
        code: 'custom',
        path: ['effective_to'],
        message: 'Ngày kết thúc hiệu lực phải sau hoặc bằng ngày bắt đầu hiệu lực',
      })
    }
  })

export type UpdateRouteRateDto = z.infer<typeof updateRouteRateSchema>
