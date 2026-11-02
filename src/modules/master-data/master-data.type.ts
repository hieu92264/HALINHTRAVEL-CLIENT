import type {
  CustomerTypeEnum,
  ExpenseTypeEnum,
  ProfitCategoryEnum,
  OwnershipTypeEnum,
  PartnerTypeEnum,
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
  tourism_commission_rate: string
  joined_at: string | null
  left_at: string | null
}

export interface ExpenseType extends BaseEntity {
  code: string
  name: string
  scope: ExpenseTypeEnum
  profit_category: ProfitCategoryEnum | null
}

export interface Route extends BaseEntity {
  code: string
  customer_id: number | null
  customer_name: string | null
  name: string
  shift_name: string | null
  pickup_location: string
  dropoff_location: string
  default_pickup_time: string | null
  default_return_time: string | null
  estimated_distance_km: number | null
}
