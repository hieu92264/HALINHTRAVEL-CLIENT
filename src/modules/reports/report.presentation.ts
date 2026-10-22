import type { DataGridColumnDef } from '@/shared/components/data-grid'
import { formatDate, formatMoney } from '@/modules/finance/finance.format'

type ReportValueFormat = 'currency' | 'date' | 'boolean' | 'enum' | 'status' | 'distance' | 'percentage'

type ReportField = {
  label: string
  format?: ReportValueFormat
  values?: Record<string, string>
}

export type ReportTotal = {
  key: string
  label: string
  value: string
}

const reportFields: Record<string, ReportField> = {
  stt: { label: 'STT' },
  date: { label: 'Ngày', format: 'date' },
  code: { label: 'Mã' },
  name: { label: 'Tên' },
  type: {
    label: 'Loại',
    format: 'enum',
    values: {
      opening_balance: 'Số dư đầu kỳ',
      receipt: 'Phiếu thu',
      expense: 'Phiếu chi',
      partner_payment: 'Thanh toán chủ xe',
      dispatch_order: 'Lệnh điều xe',
    },
  },
  status: { label: 'Trạng thái', format: 'status' },
  label: { label: 'Nội dung' },
  direction: {
    label: 'Chiều thu chi',
    format: 'enum',
    values: { in: 'Thu', out: 'Chi' },
  },
  is_active: { label: 'Đang hoạt động', format: 'boolean' },
  is_locked: { label: 'Đã khóa', format: 'boolean' },
  customer_id: { label: 'Mã khách hàng' },
  customer_name: { label: 'Tên khách hàng' },
  partner_id: { label: 'Mã chủ xe' },
  partner_name: { label: 'Tên chủ xe' },
  driver_id: { label: 'Mã tài xế' },
  driver_code: { label: 'Mã tài xế' },
  driver_name: { label: 'Tên tài xế' },
  vehicle_id: { label: 'Mã xe' },
  vehicle_plate: { label: 'Biển số xe' },
  vehicle_license_plate: { label: 'Biển số xe' },
  route_id: { label: 'Mã tuyến' },
  route_name: { label: 'Tên tuyến' },
  schedule_code: { label: 'Mã lịch chạy' },
  schedule_name: { label: 'Tên lịch chạy' },
  trip_schedule_no: { label: 'Mã lịch chạy' },
  trip_schedule_code: { label: 'Mã lịch chạy' },
  schedule: { label: 'Lịch chạy' },
  contract_no: { label: 'Số hợp đồng' },
  order_no: { label: 'Số lệnh điều xe' },
  dispatch_order_no: { label: 'Số lệnh điều xe' },
  dispatch_no: { label: 'Số lệnh điều xe' },
  receipt_no: { label: 'Số phiếu thu' },
  expense_no: { label: 'Số phiếu chi' },
  payment_no: { label: 'Số phiếu thanh toán' },
  remittance_no: { label: 'Số phiếu nộp tiền' },
  document_no: { label: 'Số chứng từ' },
  schedule_no: { label: 'Số lịch' },
  payroll_code: { label: 'Mã kỳ lương' },
  payroll_id: { label: 'ID kỳ lương' },
  journey: { label: 'Hành trình' },
  shift: { label: 'Ca chạy' },
  trip_type: { label: 'Loại chuyến' },
  description: { label: 'Diễn giải' },
  note: { label: 'Ghi chú' },
  pickup_time: { label: 'Giờ đón' },
  return_time: { label: 'Giờ về' },
  scheduled_start_at: { label: 'Thời gian khởi hành', format: 'date' },
  scheduled_end_at: { label: 'Thời gian kết thúc', format: 'date' },
  actual_start_at: { label: 'Thời gian xuất bến', format: 'date' },
  actual_end_at: { label: 'Thời gian về bến', format: 'date' },
  start_odometer: { label: 'ODO đầu' },
  end_odometer: { label: 'ODO cuối' },
  odo_start: { label: 'ODO đầu' },
  odo_end: { label: 'ODO cuối' },
  actual_distance_km: { label: 'Quãng đường chạy', format: 'distance' },
  estimated_distance_km: { label: 'Quãng đường dự kiến', format: 'distance' },
  distance_km: { label: 'Quãng đường chạy', format: 'distance' },
  total_distance: { label: 'Tổng quãng đường', format: 'distance' },
  total_distance_km: { label: 'Tổng quãng đường', format: 'distance' },
  waiting_hours: { label: 'Thời gian chờ (giờ)' },
  payment_method: {
    label: 'Phương thức thanh toán',
    format: 'enum',
    values: { cash: 'Tiền mặt', bank_transfer: 'Chuyển khoản' },
  },
  receipt_type: {
    label: 'Loại thu',
    format: 'enum',
    values: { deposit: 'Đặt cọc', contract_payment: 'Thanh toán hợp đồng', other: 'Khác' },
  },
  scope: {
    label: 'Phạm vi',
    format: 'enum',
    values: { vehicle: 'Xe', trip: 'Chuyến xe', general: 'Chi phí chung' },
  },
  work_type: {
    label: 'Loại công',
    format: 'enum',
    values: { fixed_trip: 'Chuyến cố định', tourism_trip: 'Chuyến du lịch', other: 'Công khác' },
  },
  work_date: { label: 'Ngày công', format: 'date' },
  received_at: { label: 'Ngày thu', format: 'date' },
  expense_date: { label: 'Ngày chi', format: 'date' },
  paid_at: { label: 'Ngày thanh toán', format: 'date' },
  from_date: { label: 'Từ ngày', format: 'date' },
  to_date: { label: 'Đến ngày', format: 'date' },
  month: { label: 'Tháng' },
  period: { label: 'Kỳ lương' },
  expense_type: { label: 'Loại chi phí' },
  vehicle_type: { label: 'Loại xe' },
  calculation_type: {
    label: 'Loại tính lương',
    format: 'enum',
    values: {
      fixed_trip: 'Lương chuyến công nhân',
      tourism_commission: 'Lương chuyến du lịch',
      direct_customer_collection: 'Lái xe thu tiền',
      driver_reimbursement: 'Lái xe tự chi',
      driver_cash_remittance: 'Lái xe nộp tiền',
      allowance: 'Lương trách nhiệm',
    },
  },
  opening_balance: { label: 'Số dư đầu kỳ', format: 'currency' },
  incurred_amount: { label: 'Phát sinh', format: 'currency' },
  customer_amount: { label: 'Doanh thu khách hàng', format: 'currency' },
  contract_amount: { label: 'Giá trị hợp đồng', format: 'currency' },
  signed_amount: { label: 'Giá trị thu chi', format: 'currency' },
  received_amount: { label: 'Đã thu', format: 'currency' },
  paid_amount: { label: 'Đã thanh toán', format: 'currency' },
  partner_vehicle_cost: { label: 'Chi phí chủ xe', format: 'currency' },
  external_driver_cost: { label: 'Chi phí lái xe ngoài', format: 'currency' },
  driver_reimbursement: { label: 'Hoàn lại lái xe', format: 'currency' },
  driver_remittance_amount: { label: 'Lái xe đã nộp', format: 'currency' },
  driver_collected_amount: { label: 'Lái xe thu', format: 'currency' },
  driver_remitted_amount: { label: 'Lái xe nộp', format: 'currency' },
  company_collected_amount: { label: 'Công ty thu', format: 'currency' },
  remaining_receivable: { label: 'Còn phải thu', format: 'currency' },
  direct_customer_collection: { label: 'Khách trả qua lái xe', format: 'currency' },
  advance_amount: { label: 'Tạm ứng', format: 'currency' },
  deduction_amount: { label: 'Khấu trừ', format: 'currency' },
  base_salary: { label: 'Lương cơ bản', format: 'currency' },
  responsibility_allowance: { label: 'Phụ cấp trách nhiệm', format: 'currency' },
  meal_allowance: { label: 'Phụ cấp ăn ca', format: 'currency' },
  fixed_trip_wage: { label: 'Lương chuyến công nhân', format: 'currency' },
  tourism_commission: { label: 'Hoa hồng xe du lịch', format: 'currency' },
  other_allowance: { label: 'Phụ cấp khác', format: 'currency' },
  fixed_trip_amount: { label: 'Doanh thu xe tuyến', format: 'currency' },
  tourism_trip_amount: { label: 'Doanh thu xe du lịch', format: 'currency' },
  other_trip_amount: { label: 'Doanh thu khác', format: 'currency' },
  debit: { label: 'Nợ phát sinh', format: 'currency' },
  credit: { label: 'Có phát sinh', format: 'currency' },
  balance: { label: 'Nợ cuối kỳ', format: 'currency' },
  closing_balance: { label: 'Số dư cuối kỳ', format: 'currency' },
  amount: { label: 'Số tiền', format: 'currency' },
  base_amount: { label: 'Số tiền gốc', format: 'currency' },
  rate: { label: 'Tỷ lệ', format: 'percentage' },
  total_amount: { label: 'Tổng tiền', format: 'currency' },
  unit_price: { label: 'Đơn giá', format: 'currency' },
  customer_price: { label: 'Đơn giá khách hàng', format: 'currency' },
  driver_wage: { label: 'Tiền công lái xe', format: 'currency' },
  revenue: { label: 'Doanh thu', format: 'currency' },
  total_revenue: { label: 'Tổng doanh thu', format: 'currency' },
  expense: { label: 'Chi phí', format: 'currency' },
  expenses: { label: 'Chi phí', format: 'currency' },
  expense_amount: { label: 'Tổng chi phí', format: 'currency' },
  total_expense: { label: 'Tổng chi phí', format: 'currency' },
  fuel_expense: { label: 'Chi phí nhiên liệu', format: 'currency' },
  maintenance_expense: { label: 'Chi phí bảo dưỡng', format: 'currency' },
  fuel_cost: { label: 'Chi phí dầu', format: 'currency' },
  repair_cost: { label: 'Chi phí sửa chữa', format: 'currency' },
  insurance_registration_cost: { label: 'Chi phí bảo hiểm, đăng kiểm', format: 'currency' },
  other_cost: { label: 'Chi phí khác', format: 'currency' },
  general_cost_allocated: { label: 'Chi phí chung phân bổ', format: 'currency' },
  total_cost: { label: 'Tổng chi phí', format: 'currency' },
  cost: { label: 'Tổng chi phí', format: 'currency' },
  partner_payments: { label: 'Chi đối tác', format: 'currency' },
  payroll: { label: 'Chi lương', format: 'currency' },
  external_vehicle_profit: { label: 'Lợi nhuận', format: 'currency' },
  profit: { label: 'Lợi nhuận', format: 'currency' },
  gross_salary: { label: 'Tổng lương', format: 'currency' },
  net_salary: { label: 'Thực nhận', format: 'currency' },
  trip_count: { label: 'Số chuyến chạy' },
  trips: { label: 'Số chuyến' },
  completed_trips: { label: 'Chuyến hoàn tất' },
  count: { label: 'Số bản ghi' },
  inflow: { label: 'Tổng thu', format: 'currency' },
  outflow: { label: 'Tổng chi', format: 'currency' },
  net_cash: { label: 'Chênh lệch thu chi', format: 'currency' },
  trips_count: { label: 'Số chuyến chạy' },
  total_trips: { label: 'Tổng số chuyến' },
  total_trip_count: { label: 'Tổng số chuyến' },
  total_fixed_trips: { label: 'Số chuyến công nhân' },
  total_tourism_trips: { label: 'Số chuyến du lịch' },
  fixed_trip_count: { label: 'Số chuyến công nhân' },
  tourism_trip_count: { label: 'Số chuyến du lịch' },
  vehicle_count: { label: 'Số xe vận hành' },
  total_vehicles: { label: 'Tổng số xe' },
  driver_count: { label: 'Số lái xe' },
}

const statusLabels: Record<string, string> = {
  planned: 'Chờ phân công',
  assigned: 'Đã xác nhận',
  in_progress: 'Đang chạy',
  completed: 'Hoàn tất',
  needs_reconciliation: 'Cần đối soát',
  overdue: 'Quá hạn',
  cancelled: 'Đã hủy',
  draft: 'Nháp',
  calculated: 'Đã tính',
  approved: 'Đã duyệt',
  paid: 'Đã thanh toán',
  locked: 'Đã khóa',
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
}

export function getReportField(key: string): ReportField {
  return reportFields[key] ?? { label: `Dữ liệu chưa đặt tên (${key})` }
}

export function reportFilterPlaceholder(key: string): string {
  return `Lọc ${getReportField(key).label.toLocaleLowerCase('vi-VN')}`
}

export function formatReportValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Có' : 'Không'

  const field = getReportField(key)

  switch (field.format) {
    case 'currency':
      return formatMoney(Number(value))
    case 'date':
      return formatDate(String(value))
    case 'distance':
      return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(Number(value))} km`
    case 'percentage':
      return new Intl.NumberFormat('vi-VN', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(Number(value))
    case 'boolean':
      return Boolean(value) ? 'Có' : 'Không'
    case 'enum':
      return field.values?.[String(value).toLocaleLowerCase('en-US')] ?? 'Khác'
    case 'status':
      return statusLabels[String(value).toLocaleLowerCase('en-US')] ?? 'Không xác định'
    default:
      return String(value)
  }
}

export function createReportColumn(key: string): DataGridColumnDef<Record<string, unknown>> {
  const field = getReportField(key)

  return {
    accessorKey: key,
    header: field.label,
    meta: { label: field.label, filterPlaceholder: reportFilterPlaceholder(key) },
    cell: ({ getValue }) => formatReportValue(key, getValue()),
  }
}

export function createReportTotals(totals: Record<string, unknown>): ReportTotal[] {
  return Object.entries(totals).map(([key, value]) => ({
    key,
    label: getReportField(key).label,
    value: formatReportValue(key, value),
  }))
}
