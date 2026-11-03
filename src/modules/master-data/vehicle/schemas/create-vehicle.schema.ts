import { OwnershipTypeEnum } from '@/modules/master-data/master-data.enum'
import z from 'zod'

const nullableText = (maxLength: number, label: string) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() || null : value),
    z.string().max(maxLength, { message: `${label} không được vượt quá ${maxLength} ký tự` }).nullable(),
  )

export const vehicleFieldsSchema = z
  .object({
    license_plate: z
      .string()
      .trim()
      .min(1, { message: 'Biển số không được để trống' })
      .max(50, { message: 'Biển số không được vượt quá 50 ký tự' }),
    seat_count: z.coerce
      .number()
      .int({ message: 'Số chỗ phải là số nguyên' })
      .min(1, { message: 'Số chỗ phải lớn hơn 0' })
      .max(999, { message: 'Số chỗ không được vượt quá 999' }),
    vehicle_model: nullableText(255, 'Hãng/loại xe'),
    ownership_type: z.nativeEnum(OwnershipTypeEnum),
    partner_id: z.number().int().positive().nullable(),
    note: nullableText(5000, 'Ghi chú'),
  })
  .superRefine((vehicle, context) => {
    if (vehicle.ownership_type === OwnershipTypeEnum.INDIVIDUAL && !vehicle.partner_id) {
      context.addIssue({ code: 'custom', path: ['partner_id'], message: 'Vui lòng chọn đối tác chủ xe' })
    }
  })

export const createVehicleSchema = vehicleFieldsSchema
export type CreateVehicleDto = z.infer<typeof createVehicleSchema>
