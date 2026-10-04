import {
  customerIdSchema,
  estimatedDistanceKmSchema,
  routeFieldsSchema,
  timeSchema,
} from './create-route.schema'
import z from 'zod'

export const updateRouteSchema = routeFieldsSchema.partial().extend({
  customer_id: customerIdSchema.optional(),
  default_pickup_time: timeSchema.optional(),
  default_return_time: timeSchema.optional(),
  estimated_distance_km: estimatedDistanceKmSchema.optional(),
  is_active: z.boolean().optional(),
})

export type UpdateRouteDto = z.infer<typeof updateRouteSchema>
