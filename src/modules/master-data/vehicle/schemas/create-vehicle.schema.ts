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
    vehicle_type_id: z.coerce.number().int().positive('Vui lòng chọn loại xe'),
    default_driver_id: z.coerce.number().int().positive('Vui lòng chọn tài xế mặc định'),
    note: nullableText(5000, 'Ghi chú'),
  })

export const createVehicleSchema = vehicleFieldsSchema
export type CreateVehicleDto = z.infer<typeof createVehicleSchema>
