export type Money = string | number

export type PaymentMethod = 'cash' | 'bank_transfer'

export interface FinancialDocument {
  id: number
  is_active?: boolean
  is_locked?: boolean
  locked_at?: string | null
}

export interface Receipt extends FinancialDocument {
  receipt_no: string
  customer_id: number
  customer_name?: string | null
  contract_id: number | null
  contract_no?: string | null
  receipt_type: 'deposit' | 'contract_payment' | 'other'
  settlement_type: 'standard' | 'driver_direct_collection'
  dispatch_order_id: number | null
  dispatch_order_no?: string | null
  driver_id: number | null
  driver_name?: string | null
  received_at: string
  amount: Money
  payment_method: PaymentMethod
  payer_name: string | null
  description: string | null
  contract_total?: Money
  received_total?: Money
  outstanding_amount?: Money
}

export interface Expense extends FinancialDocument {
  expense_no: string
  expense_type_id: number
  expense_type_name?: string | null
  scope: 'vehicle' | 'trip' | 'general'
  vehicle_id: number | null
  vehicle_license_plate?: string | null
  dispatch_order_id: number | null
  dispatch_order_no?: string | null
  partner_id: number | null
  partner_name?: string | null
  driver_id: number | null
  driver_name?: string | null
  expense_date: string
  amount: Money
  payment_method: PaymentMethod
  document_no: string | null
  description: string | null
  settlement_type: 'standard' | 'driver_reimbursement' | 'external_driver_payment'
}

export interface PartnerPayment extends FinancialDocument {
  payment_no: string
  partner_id: number
  partner_name?: string | null
  dispatch_order_id: number | null
  dispatch_order_no?: string | null
  paid_at: string
  amount: Money
  payment_method: PaymentMethod
  description: string | null
}

export interface DriverCashRemittance extends FinancialDocument {
  remittance_no: string
  receipt_id: number
  receipt_no?: string | null
  dispatch_order_id: number
  dispatch_order_no?: string | null
  driver_id: number
  driver_name?: string | null
  remitted_at: string
  amount: Money
  payment_method: PaymentMethod
  description: string | null
}

export interface DebtRow {
  id?: number
  code?: string
  name?: string
  customer_id?: number
  customer_name?: string
  partner_id?: number
  partner_name?: string
  driver_id?: number
  driver_name?: string
  contract_no?: string | null
  opening_balance: Money
  incurred_amount?: Money
  contract_amount?: Money
  received_amount?: Money
  paid_amount?: Money
  fixed_trip_amount?: Money
  tourism_trip_amount?: Money
  other_trip_amount?: Money
  closing_balance: Money
}

export interface DebtReport {
  filters: Record<string, string>
  generated_at: string
  totals: Record<string, Money>
  rows: DebtRow[]
}

export interface DriverAdvance {
  id: number
  advance_no: string
  driver_id: number
  driver_name?: string | null
  advance_date: string
  amount: Money
  description: string | null
  status: 'pending' | 'confirmed' | 'payroll_locked'
  payroll_id?: number | null
  payroll_code?: string | null
}

export interface DriverAttendance {
  id: number
  driver_id: number
  driver_name?: string | null
  dispatch_order_id: number
  dispatch_order_no?: string | null
  work_date: string
  work_type: 'fixed_trip' | 'tourism_trip' | 'other'
  work_units: Money
  base_amount: Money
  rate: Money
  calculated_wage: Money
  status: 'pending' | 'confirmed' | 'payroll_locked'
  calculation_note?: string | null
}

export interface PayrollItemDetail {
  id: number
  calculation_type: string
  base: Money
  rate: Money
  amount: Money
  driver_attendance_id?: number | null
  dispatch_order_no?: string | null
  receipt_no?: string | null
  expense_no?: string | null
  remittance_no?: string | null
  work_date?: string | null
}

export interface PayrollItem {
  id: number
  driver_id: number
  driver_name?: string | null
  base_salary: Money
  responsibility_allowance: Money
  meal_allowance: Money
  fixed_trip_wage: Money
  tourism_commission: Money
  other_allowance: Money
  advance_amount: Money
  deduction_amount: Money
  direct_customer_collection: Money
  driver_reimbursement: Money
  driver_remittance_amount: Money
  gross_salary: Money
  net_salary: Money
  note: string | null
  details?: PayrollItemDetail[]
}

export interface Payroll {
  id: number
  code: string
  month: number
  year: number
  from_date: string
  to_date: string
  status: 'draft' | 'calculated' | 'approved' | 'paid' | 'locked'
  gross_salary?: Money
  net_salary?: Money
  total_gross?: Money
  total_net?: Money
  items?: PayrollItem[]
}

export type ReceiptPayload = Omit<
  Receipt,
  | keyof FinancialDocument
  | 'receipt_no'
  | 'contract_total'
  | 'received_total'
  | 'outstanding_amount'
  | 'customer_name'
  | 'contract_no'
>
export type ExpensePayload = Omit<
  Expense,
  | keyof FinancialDocument
  | 'expense_no'
  | 'expense_type_name'
  | 'vehicle_license_plate'
  | 'dispatch_order_no'
  | 'partner_name'
  | 'driver_name'
>
export type PartnerPaymentPayload = Omit<
  PartnerPayment,
  keyof FinancialDocument | 'payment_no' | 'partner_name' | 'dispatch_order_no'
>
export type DriverCashRemittancePayload = Omit<
  DriverCashRemittance,
  keyof FinancialDocument | 'remittance_no' | 'receipt_no' | 'dispatch_order_no' | 'driver_name'
>
export type DriverAdvancePayload = Pick<
  DriverAdvance,
  'driver_id' | 'advance_date' | 'amount' | 'description'
>
export type PayrollPayload = Pick<Payroll, 'month' | 'year' | 'from_date' | 'to_date'>
