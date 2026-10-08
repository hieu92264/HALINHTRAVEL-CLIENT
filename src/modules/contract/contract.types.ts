import type { RentalServiceType } from '@/modules/rental/rental.types'

export type ContractType = 'trip' | 'principle'
export type ContractStatus = 'draft' | 'active' | 'completed' | 'cancelled'
export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'

export interface ContractItem {
  id: number
  route_id: number | null
  route_name: string | null
  vehicle_type_id: number
  vehicle_type_name: string | null
  service_type: RentalServiceType
  quantity: number
  unit_price: string
  driver_wage: string
  pickup_location: string | null
  dropoff_location: string | null
  note: string | null
}
export interface Contract {
  id: number
  contract_no: string
  customer_id: number
  customer_name: string | null
  rental_request_id: number | null
  rental_request_no: string | null
  quotation_id: number | null
  quotation_no: string | null
  contract_type: ContractType
  signed_date: string | null
  effective_from: string
  effective_to: string | null
  total_amount: string
  deposit_required: string
  payment_terms: string | null
  terms: string | null
  status: ContractStatus
  is_active: boolean
  items: ContractItem[]
}
export type ContractItemPayload = Omit<ContractItem, 'id' | 'route_name' | 'vehicle_type_name'>
export interface ContractPayload {
  customer_id: number
  contract_type: ContractType
  signed_date: string | null
  effective_from: string
  effective_to: string | null
  deposit_required: string
  payment_terms: string | null
  terms: string | null
  items: ContractItemPayload[]
}
export interface ContractFromQuotationPayload {
  quotation_id: number
  contract_type: ContractType
  signed_date: string | null
  effective_from: string
  effective_to: string | null
  deposit_required: string
  payment_terms: string | null
  terms: string | null
}
export interface ScheduleDay {
  id?: number
  weekday: Weekday
  pickup_time: string
  return_time: string | null
  shift_name: string | null
}
export interface ContractScheduleRule {
  id: number
  contract_id: number
  contract_no: string | null
  contract_item_id: number
  vehicle_type_id: number | null
  vehicle_type_name: string | null
  route_id: number | null
  route_name: string | null
  effective_from: string
  effective_to: string
  default_vehicle_id: number | null
  default_vehicle_license_plate: string | null
  default_driver_id: number | null
  default_driver_code: string | null
  default_driver_name: string | null
  note: string | null
  is_active: boolean
  trip_schedules_count: number
  is_locked: boolean
  days: ScheduleDay[]
}
export interface ScheduleRulePayload {
  contract_item_id: number
  route_id: number | null
  effective_from: string
  effective_to: string
  default_vehicle_id: number | null
  default_driver_id: number | null
  note: string | null
}
export interface GeneratedTripSchedule {
  id: number
  schedule_no: string
  schedule_rule_id: number | null
  scheduled_start_at: string | null
  scheduled_end_at: string | null
  status: string | null
}
export interface GenerateTripSchedulesResult {
  schedule_rule_id: number
  created: GeneratedTripSchedule[]
  skipped: GeneratedTripSchedule[]
  conflicts: GeneratedTripSchedule[]
  summary: { created_count: number; skipped_count: number; conflicts_count: number }
}
