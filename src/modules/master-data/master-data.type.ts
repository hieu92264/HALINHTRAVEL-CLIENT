import type { CustomerTypeEnum, PartnerTypeEnum } from '@/modules/master-data/master-data.enum'

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
