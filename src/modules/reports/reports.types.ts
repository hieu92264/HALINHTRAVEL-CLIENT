export type ReportKind =
  | 'business-trips'
  | 'tourism-trips'
  | 'customer-debts'
  | 'partner-debts'
  | 'driver-payroll'
  | 'vehicle-profit'

export type ReportFilters = {
  from_date: string
  to_date: string
  customer_id?: string
  partner_id?: string
  payroll_id?: string
  vehicle_id?: string
  driver_id?: string
  route_id?: string
  license_plate?: string
  shift_name?: string
}

export type ReportRow = Record<string, string | number | boolean | null | undefined>

export type ReportResponse = {
  filters: Record<string, unknown>
  generated_at: string
  totals: Record<string, string | number>
  rows: ReportRow[]
  subject_name?: string
  opening_balance?: string | number
  closing_balance?: string | number
}
