import type { CustomerTypeEnum } from '@/modules/master-data/master-data.enum'

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
