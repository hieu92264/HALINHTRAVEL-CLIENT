import type { DataGridColumnDef } from '@/shared/components/data-grid'
import type {
  DebtRow,
  DriverAdvance,
  DriverAttendance,
  Expense,
  PartnerPayment,
  Payroll,
  Receipt,
} from '@/modules/finance/finance.types'
import {
  advanceStatusLabel,
  attendanceStatusLabel,
  expenseScopeLabel,
  formatDate,
  formatMoney,
  payrollStatusLabel,
  paymentMethodLabel,
  receiptTypeLabel,
  workTypeLabel,
} from '@/modules/finance/finance.format'

const status =
  (label: (value: string) => string) =>
  ({ getValue }: { getValue: () => unknown }) =>
    label(String(getValue()))

export const receiptColumns: DataGridColumnDef<Receipt>[] = [
  { accessorKey: 'receipt_no', header: 'Số phiếu', fixed: 'left', meta: { label: 'Số phiếu' } },
  {
    accessorKey: 'received_at',
    header: 'Ngày thu',
    cell: ({ getValue }) => formatDate(String(getValue())),
    meta: { label: 'Ngày thu' },
  },
  { accessorKey: 'customer_name', header: 'Khách hàng', meta: { label: 'Khách hàng' } },
  {
    accessorKey: 'contract_no',
    header: 'Hợp đồng',
    cell: ({ getValue }) => String(getValue() ?? '—'),
    meta: { label: 'Hợp đồng' },
  },
  {
    accessorKey: 'receipt_type',
    header: 'Loại thu',
    cell: ({ getValue }) => receiptTypeLabel(String(getValue())),
    meta: { label: 'Loại thu' },
  },
  {
    accessorKey: 'amount',
    header: 'Số tiền',
    cell: ({ getValue }) => formatMoney(getValue() as string | number),
    meta: { label: 'Số tiền' },
    align: 'right',
  },
  {
    accessorKey: 'payment_method',
    header: 'Phương thức',
    cell: ({ getValue }) => paymentMethodLabel(String(getValue())),
    meta: { label: 'Phương thức' },
  },
]
export const expenseColumns: DataGridColumnDef<Expense>[] = [
  {
    accessorKey: 'expense_no',
    header: 'Số chứng từ',
    fixed: 'left',
    meta: { label: 'Số chứng từ' },
  },
  {
    accessorKey: 'expense_date',
    header: 'Ngày chi',
    cell: ({ getValue }) => formatDate(String(getValue())),
    meta: { label: 'Ngày chi' },
  },
  { accessorKey: 'expense_type_name', header: 'Loại chi phí', meta: { label: 'Loại chi phí' } },
  {
    accessorKey: 'scope',
    header: 'Phạm vi',
    cell: ({ getValue }) => expenseScopeLabel(String(getValue())),
    meta: { label: 'Phạm vi' },
  },
  {
    accessorKey: 'amount',
    header: 'Số tiền',
    cell: ({ getValue }) => formatMoney(getValue() as string | number),
    align: 'right',
    meta: { label: 'Số tiền' },
  },
  {
    accessorKey: 'document_no',
    header: 'Số hóa đơn',
    cell: ({ getValue }) => String(getValue() ?? '—'),
    meta: { label: 'Số hóa đơn' },
  },
]
export const partnerPaymentColumns: DataGridColumnDef<PartnerPayment>[] = [
  {
    accessorKey: 'payment_no',
    header: 'Số phiếu chi',
    fixed: 'left',
    meta: { label: 'Số phiếu chi' },
  },
  {
    accessorKey: 'paid_at',
    header: 'Ngày chi',
    cell: ({ getValue }) => formatDate(String(getValue())),
    meta: { label: 'Ngày chi' },
  },
  { accessorKey: 'partner_name', header: 'Đối tác', meta: { label: 'Đối tác' } },
  {
    accessorKey: 'dispatch_order_no',
    header: 'Lệnh điều xe',
    cell: ({ getValue }) => String(getValue() ?? '—'),
    meta: { label: 'Lệnh điều xe' },
  },
  {
    accessorKey: 'amount',
    header: 'Số tiền',
    cell: ({ getValue }) => formatMoney(getValue() as string | number),
    align: 'right',
    meta: { label: 'Số tiền' },
  },
  {
    accessorKey: 'payment_method',
    header: 'Phương thức',
    cell: ({ getValue }) => paymentMethodLabel(String(getValue())),
    meta: { label: 'Phương thức' },
  },
]
export const debtColumns: DataGridColumnDef<DebtRow>[] = [
  {
    accessorKey: 'name',
    header: 'Đối tượng',
    cell: ({ row }) =>
      row.original.customer_name ?? row.original.partner_name ?? row.original.name ?? '—',
    fixed: 'left',
    meta: { label: 'Đối tượng' },
  },
  {
    accessorKey: 'contract_no',
    header: 'Hợp đồng',
    cell: ({ getValue }) => String(getValue() ?? '—'),
    meta: { label: 'Hợp đồng' },
  },
  {
    accessorKey: 'opening_balance',
    header: 'Dư đầu kỳ',
    cell: ({ getValue }) => formatMoney(getValue() as string | number),
    align: 'right',
    meta: { label: 'Dư đầu kỳ' },
  },
  {
    accessorKey: 'incurred_amount',
    header: 'Phát sinh',
    cell: ({ row }) => formatMoney(row.original.incurred_amount ?? row.original.contract_amount),
    align: 'right',
    meta: { label: 'Phát sinh' },
  },
  {
    accessorKey: 'closing_balance',
    header: 'Dư cuối kỳ',
    cell: ({ getValue }) => formatMoney(getValue() as string | number),
    align: 'right',
    meta: { label: 'Dư cuối kỳ' },
  },
]
export const advanceColumns: DataGridColumnDef<DriverAdvance>[] = [
  { accessorKey: 'advance_no', header: 'Số tạm ứng', fixed: 'left', meta: { label: 'Số tạm ứng' } },
  {
    accessorKey: 'advance_date',
    header: 'Ngày tạm ứng',
    cell: ({ getValue }) => formatDate(String(getValue())),
    meta: { label: 'Ngày tạm ứng' },
  },
  { accessorKey: 'driver_name', header: 'Tài xế', meta: { label: 'Tài xế' } },
  {
    accessorKey: 'amount',
    header: 'Số tiền',
    cell: ({ getValue }) => formatMoney(getValue() as string | number),
    align: 'right',
    meta: { label: 'Số tiền' },
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: status(advanceStatusLabel),
    meta: { label: 'Trạng thái' },
  },
]
export const attendanceColumns: DataGridColumnDef<DriverAttendance>[] = [
  {
    accessorKey: 'work_date',
    header: 'Ngày công',
    fixed: 'left',
    cell: ({ getValue }) => formatDate(String(getValue())),
    meta: { label: 'Ngày công' },
  },
  { accessorKey: 'driver_name', header: 'Tài xế', meta: { label: 'Tài xế' } },
  { accessorKey: 'dispatch_order_no', header: 'Lệnh điều xe', meta: { label: 'Lệnh điều xe' } },
  {
    accessorKey: 'work_type',
    header: 'Loại công',
    cell: ({ getValue }) => workTypeLabel(String(getValue())),
    meta: { label: 'Loại công' },
  },
  {
    accessorKey: 'calculated_wage',
    header: 'Tiền công',
    cell: ({ getValue }) => formatMoney(getValue() as string | number),
    align: 'right',
    meta: { label: 'Tiền công' },
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: status(attendanceStatusLabel),
    meta: { label: 'Trạng thái' },
  },
]
export const payrollColumns: DataGridColumnDef<Payroll>[] = [
  { accessorKey: 'code', header: 'Mã kỳ lương', fixed: 'left', meta: { label: 'Mã kỳ lương' } },
  {
    id: 'period',
    header: 'Kỳ',
    cell: ({ row }) => `Tháng ${row.original.month}/${row.original.year}`,
    meta: { label: 'Kỳ' },
  },
  {
    accessorKey: 'from_date',
    header: 'Từ ngày',
    cell: ({ getValue }) => formatDate(String(getValue())),
    meta: { label: 'Từ ngày' },
  },
  {
    accessorKey: 'to_date',
    header: 'Đến ngày',
    cell: ({ getValue }) => formatDate(String(getValue())),
    meta: { label: 'Đến ngày' },
  },
  {
    accessorKey: 'total_net',
    header: 'Thực nhận',
    cell: ({ row }) => formatMoney(row.original.total_net ?? row.original.net_salary),
    align: 'right',
    meta: { label: 'Thực nhận' },
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: status(payrollStatusLabel),
    meta: { label: 'Trạng thái' },
  },
]
