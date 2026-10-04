import z from 'zod'

const numberInput = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => {
      if (typeof value !== 'string' || !value.trim()) return value

      return Number(value)
    },
    schema,
  )

export const tourDriverCommissionRateSchema = numberInput(
  z
    .number()
    .finite({ message: 'Tỷ lệ hoa hồng tài xế tour phải là số hợp lệ' })
    .min(0, { message: 'Tỷ lệ hoa hồng tài xế tour không được nhỏ hơn 0%' })
    .max(100, { message: 'Tỷ lệ hoa hồng tài xế tour không được vượt quá 100%' })
    .refine((value) => Number.isInteger(value * 100), {
      message: 'Tỷ lệ hoa hồng tài xế tour chỉ được có tối đa 2 chữ số thập phân',
    }),
)

export const vehicleTypeFieldsSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, { message: 'Mã loại xe không được để trống' })
    .max(30, { message: 'Mã loại xe không được vượt quá 30 ký tự' }),
  name: z
    .string()
    .trim()
    .min(1, { message: 'Tên loại xe không được để trống' })
    .max(100, { message: 'Tên loại xe không được vượt quá 100 ký tự' }),
  seats: numberInput(
    z
      .number()
      .finite({ message: 'Số chỗ phải là số hợp lệ' })
      .int({ message: 'Số chỗ phải là số nguyên' })
      .min(1, { message: 'Số chỗ phải lớn hơn hoặc bằng 1' }),
  ),
  tour_driver_commission_rate: tourDriverCommissionRateSchema.default(0),
})

export const createVehicleTypeSchema = vehicleTypeFieldsSchema

export type CreateVehicleTypeDto = z.infer<typeof createVehicleTypeSchema>
