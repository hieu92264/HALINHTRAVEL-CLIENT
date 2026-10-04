import {
  OwnershipTypeEnum,
  VehicleStatusEnum,
} from '@/modules/master-data/master-data.enum'
import z from 'zod'

const numberInput = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string' || !value.trim()) return value

      return Number(value)
    },
    schema,
  )

const nullableText = (maxLength?: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value

      return value.trim() || null
    },
    maxLength === undefined
      ? z.string().nullable().optional()
      : z.string().max(maxLength).nullable().optional(),
  )

const nullableInteger = (label: string, min?: number, max?: number) => {
  let schema = z.number().finite({ message: `${label} phải là số hợp lệ` }).int({
    message: `${label} phải là số nguyên`,
  })

  if (min !== undefined) {
    schema = schema.min(min, { message: `${label} không được nhỏ hơn ${min}` })
  }

  if (max !== undefined) {
    schema = schema.max(max, { message: `${label} không được vượt quá ${max}` })
  }

  return z.preprocess(
    (value) => {
      if (typeof value === 'string') return value.trim() ? Number(value) : null
      return value
    },
    schema.nullable().optional(),
  )
}

export const vehicleFieldsSchema = z.object({
  license_plate: z
    .string()
    .trim()
    .min(1, { message: 'Biển số xe không được để trống' })
    .max(20, { message: 'Biển số xe không được vượt quá 20 ký tự' }),
  vehicle_type_id: numberInput(
    z
      .number()
      .finite({ message: 'Loại xe phải là số hợp lệ' })
      .int({ message: 'Loại xe phải là số nguyên' }),
  ),
  ownership_type: z.nativeEnum(OwnershipTypeEnum),
  partner_id: nullableInteger('Đối tác'),
  brand: nullableText(100),
  model: nullableText(100),
  manufacture_year: nullableInteger('Năm sản xuất', 1886, 9999),
  current_odometer: nullableInteger('Số công tơ mét hiện tại', 0),
  vehicle_status: z.nativeEnum(VehicleStatusEnum),
  notes: nullableText(),
})

export const createVehicleSchema = vehicleFieldsSchema
  .superRefine((vehicle, context) => {
    if (vehicle.ownership_type === OwnershipTypeEnum.INDIVIDUAL && vehicle.partner_id == null) {
      context.addIssue({
        code: 'custom',
        path: ['partner_id'],
        message: 'Đối tác là bắt buộc khi loại sở hữu là đối tác',
      })
    }
  })
  .transform((vehicle) => {
    if (vehicle.ownership_type === OwnershipTypeEnum.COMPANY) {
      return { ...vehicle, partner_id: null }
    }

    return vehicle
  })

export type CreateVehicleDto = z.infer<typeof createVehicleSchema>
