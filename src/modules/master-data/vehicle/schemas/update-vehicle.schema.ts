import z from 'zod'

export const updateVehicleSchema = z.object({
  license_plate: z.string().trim().min(1).max(50).optional(),
  seat_count: z.coerce.number().int().min(1).max(999).optional(),
  vehicle_model: z.string().trim().max(255).nullable().optional(),
  ownership_type: z.enum(['company', 'partner']).optional(),
  partner_id: z.number().int().positive().nullable().optional(),
  note: z.string().trim().max(5000).nullable().optional(),
  is_active: z.boolean().optional(),
})

export type UpdateVehicleDto = Partial<import('./create-vehicle.schema').CreateVehicleDto> & {
  is_active?: boolean
}
