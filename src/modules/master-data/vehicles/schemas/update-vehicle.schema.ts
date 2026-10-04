import { OwnershipTypeEnum } from '@/modules/master-data/master-data.enum'
import { vehicleFieldsSchema } from './create-vehicle.schema'
import z from 'zod'

export const updateVehicleSchema = vehicleFieldsSchema
  .partial()
  .extend({
    is_active: z.boolean().optional(),
  })
  .transform((vehicle) => {
    if (vehicle.ownership_type === OwnershipTypeEnum.COMPANY) {
      return { ...vehicle, partner_id: null }
    }

    return vehicle
  })

export type UpdateVehicleDto = z.infer<typeof updateVehicleSchema>
