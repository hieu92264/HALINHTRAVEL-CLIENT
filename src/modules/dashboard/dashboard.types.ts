export type DashboardTripStatus = 'PLANNED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type DashboardAlertSeverity = 'critical' | 'warning' | 'info'

export type DashboardSectionUnavailable = { available: false }

export type DashboardSchedule = {
  id: number
  schedule_no: string
  scheduled_start_at: string | null
  scheduled_end_at: string | null
  route_name: string | null
  pickup_location: string | null
  dropoff_location: string | null
  service_type: string | null
  vehicle_type_name: string | null
  status: DashboardTripStatus | null
  vehicle_plate: string | null
  driver_name: string | null
}

export type DashboardOperations = {
  available: true
  counts: { planned: number; assigned: number; in_progress: number; completed: number; cancelled: number; total: number }
  schedules: DashboardSchedule[]
} | DashboardSectionUnavailable

export type DashboardAlert = { type: string; severity: DashboardAlertSeverity; count: number; message: string }
export type DashboardAlerts = { available: true; items: DashboardAlert[] } | DashboardSectionUnavailable

export type DashboardFleet = {
  available: true
  vehicles: { available: number; assigned: number; maintenance: number; inactive: number; total: number } | null
  drivers: { active: number; assigned: number; available: number } | null
} | DashboardSectionUnavailable

export type DashboardFinance = {
  available: true
  receipts: string | null
  expenses: string | null
  partner_payments: string | null
  net_cash: string | null
} | DashboardSectionUnavailable

export type DashboardOverview = {
  selected_date: string
  generated_at: string
  operations: DashboardOperations
  alerts: DashboardAlerts
  fleet: DashboardFleet
  finance: DashboardFinance
}

export type DashboardUpdatedEvent = { sections: string[]; occurred_at: string }
