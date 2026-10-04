import {
  tourDriverCommissionRateSchema,
  vehicleTypeFieldsSchema,
} from './create-vehicle-type.schema'
import z from 'zod'

export const updateVehicleTypeSchema = vehicleTypeFieldsSchema.partial().extend({
  tour_driver_commission_rate: tourDriverCommissionRateSchema.optional(),
  is_active: z.boolean().optional(),
})

export type UpdateVehicleTypeDto = z.infer<typeof updateVehicleTypeSchema>
