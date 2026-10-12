export type ReportKind = 'fixed-trips' | 'tourism-trips' | 'finance' | 'driver-payroll' | 'profit-loss'

export type ReportFilters = {
  from_date: string
  to_date: string
  basis?: 'accrual' | 'cash'
  route_id?: string
  customer_id?: string
  vehicle_id?: string
  driver_id?: string
  partner_id?: string
}

export type ReportResponse = {
  filters: Record<string, unknown>
  generated_at: string
  totals: Record<string, string | number>
  rows: Array<Record<string, unknown>>
  chart?: Array<Record<string, unknown>> | null
}
