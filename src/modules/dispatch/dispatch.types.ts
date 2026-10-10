export type DispatchStatus = 'PLANNED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type OrderStatus = 'ISSUED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface TripAssignment {
  id: number
  assignment_type: 'PRIMARY' | 'SUBSTITUTE'
  is_current: boolean
  assigned_at: string
  replace_reason: string | null
  replaced_assignment_id: number | null
  vehicle_id: number
  license_plate: string | null
  driver_id: number
  driver_name: string | null
  driver_phone: string | null
  partner_id: number | null
  partner_name: string | null
}

export interface DispatchOrder {
  id: number
  order_no: string
  status: OrderStatus
  issued_at: string
  actual_start_at: string | null
  actual_end_at: string | null
  start_odometer: number | null
  end_odometer: number | null
  actual_distance_km: string | null
  waiting_hours: string | null
  customer_amount: string | null
  partner_vehicle_cost: string | null
  external_driver_cost: string | null
  note: string | null
  trip_schedule_id: number
  schedule_no: string | null
  service_type: string | null
  scheduled_start_at: string | null
  scheduled_end_at: string | null
  pickup_location: string | null
  dropoff_location: string | null
  journey: string | null
  route_name: string | null
  customer_name: string | null
  customer_phone: string | null
  contact_name: string | null
  assignment: TripAssignment | null
}

export interface TripSchedule {
  id: number
  schedule_no: string
  status: DispatchStatus
  service_type: string
  scheduled_start_at: string
  scheduled_end_at: string
  pickup_location: string | null
  dropoff_location: string | null
  journey: string | null
  note: string | null
  contract_id: number
  contract_no: string | null
  customer_id: number | null
  customer_name: string | null
  route_id: number | null
  route_name: string | null
  required_vehicle_type_id: number
  required_vehicle_type_name: string | null
  assignments: TripAssignment[]
  dispatch_order: DispatchOrder | null
}

export type SchedulePayload = {
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
  required_vehicle_type_id: number
  note?: string | null
}

export type AssignmentPayload = {
  vehicle_id: number
  driver_id: number
  partner_id?: number | null
  replace_reason?: string | null
}

export type StartOrderPayload = { actual_start_at: string; start_odometer: number; note?: string | null }
export type CompleteOrderPayload = {
  actual_end_at: string
  end_odometer: number
  actual_distance_km: number
  waiting_hours?: number
  customer_amount?: number
  partner_vehicle_cost?: number
  external_driver_cost?: number
  note?: string | null
}
