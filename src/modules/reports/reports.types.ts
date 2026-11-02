export type ReportMoney = string | number

export type RunReportRow = {
  id: number
  kind: 'worker' | 'tourist'
  run_no: string
  run_date: string
  return_date: string | null
  pickup_time: string | null
  return_time: string | null
  journey: string | null
  customer_name: string | null
  license_plate: string | null
  driver_name: string | null
  partner_name: string | null
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  completed_at: string | null
  freight_amount: ReportMoney
  driver_wage: ReportMoney
  partner_vehicle_cost: ReportMoney
  hired_driver_cost: ReportMoney
}

export type RunReport = {
  title: string
  filters: { from_date: string | null; to_date: string | null }
  summary: Record<string, ReportMoney>
  rows: RunReportRow[]
}

export type HiredDriverProfitRow = {
  name: string
  incurred_amount: ReportMoney
  paid_amount: ReportMoney
  outstanding_amount: ReportMoney
}

export type ProfitReport = {
  title: string
  filters: { from_date: string | null; to_date: string | null }
  summary: Record<string, ReportMoney>
  hired_drivers: HiredDriverProfitRow[]
  revenue_runs: RunReportRow[]
}

export type PayrollSourceRow = {
  id: number
  work_date: string
  driver_name: string | null
  source_type: 'worker' | 'tourist'
  run_no: string | null
  license_plate: string | null
  base_amount: ReportMoney
  rate: ReportMoney
  calculated_wage: ReportMoney
  status: 'pending' | 'confirmed' | 'payroll_locked'
}

export type PayrollSourceReport = {
  title: string
  filters: { from_date: string | null; to_date: string | null }
  summary: Record<string, ReportMoney>
  rows: PayrollSourceRow[]
}

export type ReportFilters = {
  from_date: string
  to_date: string
}
