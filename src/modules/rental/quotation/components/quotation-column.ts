import { formatCurrency, formatDate, quotationStatusLabel } from '@/modules/rental/rental.format'
import type { Quotation } from '@/modules/rental/rental.types'
import type { DataGridColumnDef } from '@/shared/components/data-grid'
import { h } from 'vue'

const statusClass = (status: Quotation['status']) => {
  if (status === 'approved') return 'bg-success/10 text-success'
  if (status === 'rejected' || status === 'expired') return 'bg-destructive/10 text-destructive'
  if (status === 'sent') return 'bg-primary/10 text-primary'

  return 'bg-muted text-muted-foreground'
}

export const quotationColumns: DataGridColumnDef<Quotation>[] = [
  {
    accessorKey: 'quotation_no',
    header: 'Mã báo giá',
    cell: ({ row }) => h('span', { class: 'font-medium' }, row.original.quotation_no),
    width: 132,
    fixed: 'left',
    meta: { label: 'Mã báo giá', filterPlaceholder: 'Mã báo giá...' },
  },
  {
    accessorKey: 'customer_name',
    header: 'Khách hàng',
    cell: ({ row }) => row.original.customer_name || '—',
    width: 180,
    meta: { label: 'Khách hàng', filterPlaceholder: 'Khách hàng...' },
  },
  {
    accessorKey: 'rental_request_no',
    header: 'Yêu cầu thuê',
    cell: ({ row }) => row.original.rental_request_no || '—',
    width: 144,
    meta: { label: 'Yêu cầu thuê', filterPlaceholder: 'Yêu cầu thuê...' },
  },
  {
    accessorKey: 'quotation_date',
    header: 'Ngày báo giá',
    cell: ({ row }) => formatDate(row.original.quotation_date),
    width: 136,
    enableColumnFilter: false,
    meta: { label: 'Ngày báo giá' },
  },
  {
    accessorKey: 'valid_until',
    header: 'Hiệu lực đến',
    cell: ({ row }) => formatDate(row.original.valid_until),
    width: 136,
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
    accessorFn: (row) => quotationStatusLabel(row.status),
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
        quotationStatusLabel(row.original.status),
      ),
    width: 132,
    meta: { label: 'Trạng thái', filterPlaceholder: 'Trạng thái...' },
  },
]
