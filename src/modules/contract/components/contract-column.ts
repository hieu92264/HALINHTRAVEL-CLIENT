import { contractStatusLabel, contractTypeLabel } from '@/modules/contract/contract.format'
import type { Contract } from '@/modules/contract/contract.types'
import { formatCurrency, formatDate } from '@/modules/rental/rental.format'
import type { DataGridColumnDef } from '@/shared/components/data-grid'
import { h } from 'vue'

const statusClass = (status: Contract['status']) =>
  status === 'active'
    ? 'bg-success/10 text-success'
    : status === 'cancelled'
      ? 'bg-destructive/10 text-destructive'
      : status === 'completed'
        ? 'bg-primary/10 text-primary'
        : 'bg-muted text-muted-foreground'
export const contractColumns: DataGridColumnDef<Contract>[] = [
  {
    accessorKey: 'contract_no',
    header: 'Mã hợp đồng',
    cell: ({ row }) => h('span', { class: 'font-medium' }, row.original.contract_no),
    width: 138,
    fixed: 'left',
    meta: { label: 'Mã hợp đồng', filterPlaceholder: 'Mã hợp đồng...' },
  },
  {
    accessorKey: 'customer_name',
    header: 'Khách hàng',
    cell: ({ row }) => row.original.customer_name || '—',
    width: 185,
    meta: { label: 'Khách hàng', filterPlaceholder: 'Khách hàng...' },
  },
  {
    id: 'contract_type',
    accessorFn: (row) => contractTypeLabel(row.contract_type),
    header: 'Loại hợp đồng',
    cell: ({ row }) => contractTypeLabel(row.original.contract_type),
    width: 176,
    meta: { label: 'Loại hợp đồng', filterPlaceholder: 'Loại hợp đồng...' },
  },
  {
    accessorKey: 'quotation_no',
    header: 'Báo giá',
    cell: ({ row }) => row.original.quotation_no || '—',
    width: 130,
    meta: { label: 'Báo giá', filterPlaceholder: 'Báo giá...' },
  },
  {
    accessorKey: 'effective_from',
    header: 'Hiệu lực từ',
    cell: ({ row }) => formatDate(row.original.effective_from),
    width: 130,
    enableColumnFilter: false,
    meta: { label: 'Hiệu lực từ' },
  },
  {
    accessorKey: 'effective_to',
    header: 'Hiệu lực đến',
    cell: ({ row }) => formatDate(row.original.effective_to),
    width: 130,
    enableColumnFilter: false,
    meta: { label: 'Hiệu lực đến' },
  },
  {
    id: 'total_amount',
    accessorFn: (row) => Number(row.total_amount),
    header: 'Tổng tiền',
    cell: ({ row }) => formatCurrency(row.original.total_amount),
    width: 148,
    align: 'right',
    meta: { label: 'Tổng tiền', filterPlaceholder: 'Tổng tiền...' },
  },
  {
    id: 'status',
    accessorFn: (row) => contractStatusLabel(row.status),
    header: 'Trạng thái',
    cell: ({ row }) =>
      h(
        'span',
        {
          class: [
            'inline-flex rounded-full px-2 py-1 text-xs font-medium',
            statusClass(row.original.status),
          ],
        },
        contractStatusLabel(row.original.status),
      ),
    width: 140,
    meta: { label: 'Trạng thái', filterPlaceholder: 'Trạng thái...' },
  },
]
