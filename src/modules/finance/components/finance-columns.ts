import { h } from 'vue'
import { payrollPeriodIssues } from '@/modules/finance/payroll-period'
import type { DataGridColumnDef } from '@/shared/components/data-grid'
import type { DebtRow, DriverAdvance, DriverAttendance, Expense, PartnerPayment, Payroll, Receipt } from '@/modules/finance/finance.types'
import { advanceStatusLabel, attendanceStatusLabel, formatDate, formatMoney, paymentMethodLabel, payrollStatusLabel, receiptTypeLabel, workTypeLabel } from '@/modules/finance/finance.format'

const status = (label: (value: string) => string) => ({ getValue }: { getValue: () => unknown }) => label(String(getValue()))

export const receiptColumns: DataGridColumnDef<Receipt>[] = [
  { accessorKey: 'receipt_no', header: 'Số phiếu', fixed: 'left', meta: { label: 'Số phiếu' } },
  { accessorKey: 'received_at', header: 'Ngày thu', cell: ({ getValue }) => formatDate(String(getValue())), meta: { label: 'Ngày thu' } },
  { accessorKey: 'customer_name', header: 'Khách hàng', meta: { label: 'Khách hàng' } },
  { accessorKey: 'receipt_type', header: 'Loại thu', cell: ({ getValue }) => receiptTypeLabel(String(getValue())), meta: { label: 'Loại thu' } },
  { accessorKey: 'payer_name', header: 'Người nộp', cell: ({ getValue }) => String(getValue() ?? '—'), meta: { label: 'Người nộp' } },
  { accessorKey: 'amount', header: 'Số tiền', cell: ({ getValue }) => formatMoney(getValue() as string | number), align: 'right', meta: { label: 'Số tiền' } },
  { accessorKey: 'payment_method', header: 'Phương thức', cell: ({ getValue }) => paymentMethodLabel(String(getValue())), meta: { label: 'Phương thức' } },
]

export const expenseColumns: DataGridColumnDef<Expense>[] = [
  { accessorKey: 'expense_no', header: 'Số phiếu chi', fixed: 'left', meta: { label: 'Số phiếu chi' } },
  { accessorKey: 'expense_date', header: 'Ngày chi', cell: ({ getValue }) => formatDate(String(getValue())), meta: { label: 'Ngày chi' } },
  { accessorKey: 'expense_type_name', header: 'Loại chi phí', meta: { label: 'Loại chi phí' } },
  { accessorKey: 'recipient_name', header: 'Người nhận', cell: ({ getValue }) => String(getValue() ?? '—'), meta: { label: 'Người nhận' } },
  { accessorKey: 'hired_driver_name', header: 'Lái thuê', cell: ({ getValue }) => String(getValue() ?? '—'), meta: { label: 'Lái thuê' } },
  { accessorKey: 'amount', header: 'Số tiền', cell: ({ getValue }) => formatMoney(getValue() as string | number), align: 'right', meta: { label: 'Số tiền' } },
  { accessorKey: 'payment_method', header: 'Phương thức', cell: ({ getValue }) => paymentMethodLabel(String(getValue())), meta: { label: 'Phương thức' } },
]

export const partnerPaymentColumns: DataGridColumnDef<PartnerPayment>[] = [
  { accessorKey: 'payment_no', header: 'Số phiếu chi', fixed: 'left', meta: { label: 'Số phiếu chi' } },
  { accessorKey: 'paid_at', header: 'Ngày chi', cell: ({ getValue }) => formatDate(String(getValue())), meta: { label: 'Ngày chi' } },
  { accessorKey: 'partner_name', header: 'Đối tác', meta: { label: 'Đối tác' } },
  { accessorKey: 'amount', header: 'Số tiền', cell: ({ getValue }) => formatMoney(getValue() as string | number), align: 'right', meta: { label: 'Số tiền' } },
  { accessorKey: 'payment_method', header: 'Phương thức', cell: ({ getValue }) => paymentMethodLabel(String(getValue())), meta: { label: 'Phương thức' } },
]

export const debtColumns: DataGridColumnDef<DebtRow>[] = [
  { accessorKey: 'name', header: 'Đối tượng', cell: ({ row }) => row.original.customer_name ?? row.original.partner_name ?? row.original.hired_driver_name ?? row.original.name ?? '—', fixed: 'left', meta: { label: 'Đối tượng' } },
  { accessorKey: 'opening_balance', header: 'Dư đầu kỳ', cell: ({ getValue }) => formatMoney(getValue() as string | number), align: 'right', meta: { label: 'Dư đầu kỳ' } },
  { accessorKey: 'incurred_amount', header: 'Phát sinh', cell: ({ getValue }) => formatMoney((getValue() as string | number | null) ?? 0), align: 'right', meta: { label: 'Phát sinh' } },
  { accessorKey: 'received_amount', header: 'Đã thu', cell: ({ getValue }) => formatMoney((getValue() as string | number | null) ?? 0), align: 'right', meta: { label: 'Đã thu' } },
  { accessorKey: 'paid_amount', header: 'Đã chi', cell: ({ getValue }) => formatMoney((getValue() as string | number | null) ?? 0), align: 'right', meta: { label: 'Đã chi' } },
  { accessorKey: 'closing_balance', header: 'Dư cuối kỳ', cell: ({ getValue }) => formatMoney(getValue() as string | number), align: 'right', meta: { label: 'Dư cuối kỳ' } },
]

export const advanceColumns: DataGridColumnDef<DriverAdvance>[] = [
  { accessorKey: 'advance_no', header: 'Số tạm ứng', fixed: 'left', meta: { label: 'Số tạm ứng' } },
  { accessorKey: 'advance_date', header: 'Ngày tạm ứng', cell: ({ getValue }) => formatDate(String(getValue())), meta: { label: 'Ngày tạm ứng' } },
  { accessorKey: 'driver_name', header: 'Tài xế', meta: { label: 'Tài xế' } },
  { accessorKey: 'amount', header: 'Số tiền', cell: ({ getValue }) => formatMoney(getValue() as string | number), align: 'right', meta: { label: 'Số tiền' } },
  { accessorKey: 'status', header: 'Trạng thái', cell: status(advanceStatusLabel), meta: { label: 'Trạng thái' } },
]

export const attendanceColumns: DataGridColumnDef<DriverAttendance>[] = [
  { accessorKey: 'work_date', header: 'Ngày công', fixed: 'left', cell: ({ getValue }) => formatDate(String(getValue())), meta: { label: 'Ngày công' } },
  { accessorKey: 'driver_name', header: 'Tài xế', meta: { label: 'Tài xế' } },
  { id: 'run_no', header: 'Chuyến xe', cell: ({ row }) => row.original.worker_run_no ?? row.original.tourist_run_no ?? '—', meta: { label: 'Chuyến xe' } },
  { accessorKey: 'work_type', header: 'Loại công', cell: ({ getValue }) => workTypeLabel(String(getValue())), meta: { label: 'Loại công' } },
  { accessorKey: 'calculated_wage', header: 'Tiền công', cell: ({ getValue }) => formatMoney(getValue() as string | number), align: 'right', meta: { label: 'Tiền công' } },
  { accessorKey: 'status', header: 'Trạng thái', cell: status(attendanceStatusLabel), meta: { label: 'Trạng thái' } },
]

export const payrollColumns: DataGridColumnDef<Payroll>[] = [
  { accessorKey: 'code', header: 'Mã kỳ lương', fixed: 'left', meta: { label: 'Mã kỳ lương' } },
  { id: 'period', header: 'Kỳ', cell: ({ row }) => { const issues = payrollPeriodIssues(row.original); return h('div', [h('span', `Tháng ${row.original.month}/${row.original.year}`), ...(issues.length ? [h('p', { class: 'text-xs text-destructive', title: issues.join(' ') }, issues.join(' '))] : [])]) }, meta: { label: 'Kỳ' } },
  { accessorKey: 'from_date', header: 'Từ ngày', cell: ({ getValue }) => formatDate(String(getValue())), meta: { label: 'Từ ngày' } },
  { accessorKey: 'to_date', header: 'Đến ngày', cell: ({ getValue }) => formatDate(String(getValue())), meta: { label: 'Đến ngày' } },
  { accessorKey: 'total_net', header: 'Thực nhận', cell: ({ row }) => formatMoney(row.original.total_net ?? row.original.net_salary), align: 'right', meta: { label: 'Thực nhận' } },
  { accessorKey: 'status', header: 'Trạng thái', cell: status(payrollStatusLabel), meta: { label: 'Trạng thái' } },
]
