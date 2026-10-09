export type TripScheduleStatus = 'PLANNED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type DispatchOrderStatus =
  | 'ISSUED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PENDING_CONFIRMATION'
  | 'COMPLETED'
  | 'CANCELLED'

export interface TripAssignment {
  id: number
  trip_schedule_id: number
  vehicle_id: number
  driver_id: number
  partner_id: number | null
  assignment_type: 'PRIMARY' | 'SUBSTITUTE'
  is_current: boolean
  replace_reason: string | null
  vehicle?: { license_plate: string }
  driver?: { code: string; full_name: string }
}

export interface TripSchedule {
  id: number
  schedule_no: string
  scheduled_start_at: string
  scheduled_end_at: string
  status: TripScheduleStatus
  service_type: string
  pickup_location: string | null
  dropoff_location: string | null
  note: string | null
  required_vehicle_type?: { id: number; name: string }
  route?: { name: string }
  contract?: {
    contract_no: string
    customer?: { name: string; contact_name: string | null; phone: string | null; email: string | null }
  }
  assignments?: TripAssignment[]
  dispatch_order?: DispatchOrder
}

export interface DispatchOrder {
  id: number
  order_no: string
  trip_schedule_id: number
  trip_assignment_id: number
  status: DispatchOrderStatus
  issued_at: string
  actual_start_at: string | null
  actual_end_at: string | null
  start_odometer: number | null
  end_odometer: number | null
  actual_distance_km: string | null
  waiting_hours: string | null
  review_note: string | null
  reported_at?: string | null
  note?: string | null
  trip_schedule?: TripSchedule
  trip_assignment?: TripAssignment
}

export interface TripSchedulePayload {
  contract_id: number
  contract_item_id?: number | null
  schedule_rule_id?: number | null
  service_type: string
  route_id?: number | null
  scheduled_start_at: string
  scheduled_end_at: string
  pickup_location?: string | null
  dropoff_location?: string | null
  journey?: string | null
  required_vehicle_type_id?: number | null
  note?: string | null
}

export interface AssignmentPayload { vehicle_id: number; driver_id: number; replace_reason?: string | null }
export interface StartOrderPayload { actual_start_at: string; start_odometer: number; note?: string | null }
export interface CompletionReportPayload { actual_end_at: string; end_odometer: number; actual_distance_km?: string | null; waiting_hours?: string | null; note?: string | null }
export interface CompletionConfirmationPayload { customer_amount: string; partner_vehicle_cost?: string | null; external_driver_cost?: string | null; note?: string | null }

export type AvailabilityPayload = {
  start_at: string
  end_at: string
  items: Array<{ vehicle_type_id: number; quantity: number }>
  ownership_type?: 'company' | 'partner' | null
  partner_id?: number | null
}

export type AvailabilityResult = {
  checked_at: string
  can_fulfill: boolean
  vehicle_capacities: Array<{
    vehicle_type_id: number
    vehicle_type_name: string
    required_quantity: number
    company_available_count: number
    partner_available_count: number
    available_count: number
    is_sufficient: boolean
    candidates: Array<{ id: number; license_plate: string; ownership_type: 'company' | 'partner' | null; partner_id: number | null; partner_name: string | null }>
  }>
  driver_capacity: {
    required_quantity: number
    company_available_count: number
    partner_available_count: number
    available_count: number
    is_sufficient: boolean
    candidates: Array<{ id: number; code: string; full_name: string; ownership_type: 'company' | 'partner' | null; partner_id: number | null; partner_name: string | null; license_expired_at: string | null }>
  }
}
