import type {
  CustomerTypeEnum,
  OwnershipTypeEnum,
  PartnerTypeEnum,
  VehicleStatusEnum,
} from '@/modules/master-data/master-data.enum'

export interface Customer extends BaseEntity {
  code: string
  type: CustomerTypeEnum
  name: string
  phone: string | null
  email: string | null
  cccd: string | null
  tax_code: string | null
  address: string | null
  contact_name: string | null
  opening_balance: number
}

export interface Partner extends BaseEntity {
  code: string
  type: PartnerTypeEnum
  name: string
  phone: string | null
  email: string | null
  cccd: string | null
  tax_code: string | null
  address: string | null
  bank_name: string | null
  bank_account: string | null
  opening_balance: number
}

export interface VehicleType extends BaseEntity {
  code: string
  name: string
  seats: number
  tour_driver_commission_rate: number //% lương tài xế chuyến du lịch
}

export interface Vehicle extends BaseEntity {
  license_plate: string
  vehicle_type_id: number
  vehicle_type_name: string
  ownership_type: OwnershipTypeEnum
  partner_id: number
  partner_name: string
  brand: string | null
  model: string | null
  manufacture_year: number | null
  current_odometer: number | null
  vehicle_status: VehicleStatusEnum
  notes: string | null
}

export interface Driver extends BaseEntity {
  code: string
  user_name: string
  partner_id: number
  partner_name: string
  type: OwnershipTypeEnum
  full_name: string
  phone: string | null
  cccd: string | null
  license_number: string
  license_class: string
  license_issued_at: string
  license_expired_at: string
  base_salary: number
  responsibility_allowance: number
  joined_at: string | null
  left_at: string | null
}
