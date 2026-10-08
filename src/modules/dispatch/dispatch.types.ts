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
  contract?: { contract_no: string }
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
  trip_schedule?: TripSchedule
  trip_assignment?: TripAssignment
}

export interface AssignmentPayload { vehicle_id: number; driver_id: number; replace_reason?: string | null }
export interface CompletionReportPayload { actual_start_at: string; actual_end_at: string; start_odometer: number; end_odometer: number; actual_distance_km?: number; waiting_hours?: number; note?: string | null }
export interface CompletionConfirmationPayload { customer_amount: number; partner_vehicle_cost?: number; external_driver_cost?: number; note?: string | null }
