export type RentalRequestStatus = 'new' | 'quoted' | 'accepted' | 'rejected' | 'converted'
export type QuotationStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired' | 'superseded'
export type RentalServiceType = 'fixed' | 'tourism' | 'school' | 'business'

export interface RentalItem {
  id?: number
  vehicle_type_id: number
  vehicle_type_name?: string | null
  quantity: number
  route_id: number | null
  route_name?: string | null
  note: string | null
}

export interface RentalRequest {
  id: number
  request_no: string
  customer_id: number
  customer_name: string | null
  customer: {
    id: number
    name: string
    phone: string | null
    email: string | null
    address: string | null
    contact_name: string | null
  } | null
  source: string | null
  requested_at: string
  service_type: RentalServiceType
  pickup_location: string | null
  dropoff_location: string | null
  start_at: string | null
  end_at: string | null
  note: string | null
  status: RentalRequestStatus
  items: RentalItem[]
  user_name_created: string | null
  user_name_updated: string | null
  created_at: string | null
  updated_at: string | null
}

export interface QuotationItem {
  id?: number
  route_id: number | null
  route_name?: string | null
  vehicle_type_id: number
  vehicle_type_name?: string | null
  description: string | null
  quantity: number
  unit_price: string
  amount?: string
}

export interface Quotation {
  id: number
  quotation_no: string
  rental_request_id: number
  rental_request_no: string | null
  customer_id: number
  customer_name: string | null
  customer_email: string | null
  quotation_date: string
  valid_until: string
  subtotal: string
  discount_amount: string
  total_amount: string
  payment_terms: string | null
  status: QuotationStatus
  user_name_created: string | null
  user_name_updated: string | null
  created_at: string | null
  updated_at: string | null
  approved_by: string | null
  approved_at: string | null
  customer_responded_at: string | null
  customer_response_note: string | null
  items: QuotationItem[]
}

export type RentalRequestPayload = Omit<
  RentalRequest,
  | 'id'
  | 'request_no'
  | 'customer_name'
  | 'customer'
  | 'status'
  | 'user_name_created'
  | 'user_name_updated'
  | 'created_at'
  | 'updated_at'
>

export type QuotationPayload = {
  rental_request_id: number
  customer_id: number
  quotation_date: string
  valid_until: string
  discount_amount: string
  payment_terms: string | null
  items: QuotationItem[]
}

export type QuotationUpdatePayload = Omit<Partial<QuotationPayload>, 'rental_request_id'>

export type PublicQuotation = Pick<
  Quotation,
  | 'quotation_no'
  | 'customer_name'
  | 'quotation_date'
  | 'valid_until'
  | 'subtotal'
  | 'discount_amount'
  | 'total_amount'
  | 'payment_terms'
  | 'status'
  | 'items'
>

export type AvailabilityPayload = {
  start_at: string
  end_at: string
  items: Array<{ vehicle_type_id: number; quantity: number }>
}

export type AvailabilityVehicleCapacity = {
  vehicle_type_id: number
  vehicle_type_name: string | null
  required_quantity: number
  company_available_count: number
  partner_available_count: number
  available_count: number
  is_sufficient: boolean
}

export type AvailabilityDriverCapacity = {
  required_quantity: number
  company_available_count: number
  partner_available_count: number
  available_count: number
  is_sufficient: boolean
}

export type AvailabilityResult = {
  checked_at: string
  start_at: string
  end_at: string
  vehicle_capacities: AvailabilityVehicleCapacity[]
  driver_capacity: AvailabilityDriverCapacity
  can_fulfill: boolean
}
