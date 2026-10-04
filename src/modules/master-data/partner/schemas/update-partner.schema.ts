import { PartnerTypeEnum } from '@/modules/master-data/master-data.enum'
import { openingBalanceSchema, partnerFieldsSchema } from './create-partner.schema'
import z from 'zod'

export const updatePartnerSchema = partnerFieldsSchema.partial().extend({
  type: z.nativeEnum(PartnerTypeEnum).optional(),
  opening_balance: openingBalanceSchema.optional(),
  is_active: z.boolean().optional(),
})

export type UpdatePartnerDto = z.infer<typeof updatePartnerSchema>
