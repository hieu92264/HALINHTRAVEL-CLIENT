import { formatDate, requestStatusLabel, serviceTypeLabel } from '@/modules/rental/rental.format'
import type { RentalRequest } from '@/modules/rental/rental.types'
import type { DataGridColumnDef } from '@/shared/components/data-grid'
import { h } from 'vue'

const statusClass = (status: RentalRequest['status']) => {
  if (status === 'accepted') return 'bg-success/10 text-success'
  if (status === 'rejected') return 'bg-destructive/10 text-destructive'
  if (status === 'quoted') return 'bg-primary/10 text-primary'

  return 'bg-muted text-muted-foreground'
}

export const rentalRequestColumns: DataGridColumnDef<RentalRequest>[] = [
  {
    accessorKey: 'request_no',
    header: 'Mã yêu cầu',
    cell: ({ row }) => h('span', { class: 'font-medium' }, row.original.request_no),
    width: 132,
    fixed: 'left',
    meta: { label: 'Mã yêu cầu', filterPlaceholder: 'Mã yêu cầu...' },
  },
  {
    accessorKey: 'customer_name',
    header: 'Khách hàng',
    cell: ({ row }) => row.original.customer_name || '—',
    width: 180,
    meta: { label: 'Khách hàng', filterPlaceholder: 'Khách hàng...' },
  },
  {
    id: 'service_type',
    accessorFn: (row) => serviceTypeLabel(row.service_type),
    header: 'Dịch vụ',
    cell: ({ row }) => serviceTypeLabel(row.original.service_type),
    width: 156,
    meta: { label: 'Dịch vụ', filterPlaceholder: 'Dịch vụ...' },
  },
  {
    id: 'journey',
    accessorFn: (row) => `${row.pickup_location || '—'} → ${row.dropoff_location || '—'}`,
    header: 'Hành trình',
    cell: ({ getValue }) => getValue<string>(),
    width: 250,
    meta: { label: 'Hành trình', filterPlaceholder: 'Hành trình...' },
  },
  {
    accessorKey: 'requested_at',
    header: 'Tiếp nhận',
    cell: ({ row }) => formatDate(row.original.requested_at, true),
    width: 158,
    enableColumnFilter: false,
    meta: { label: 'Tiếp nhận' },
  },
  {
    accessorKey: 'start_at',
    header: 'Khởi hành',
    cell: ({ row }) => formatDate(row.original.start_at, true),
    width: 158,
    enableColumnFilter: false,
    meta: { label: 'Khởi hành' },
  },
  {
    id: 'vehicle_count',
    accessorFn: (row) => row.items.reduce((total, item) => total + item.quantity, 0),
    header: 'Số xe',
    cell: ({ getValue }) => getValue<number>(),
    width: 88,
    align: 'center',
    meta: { label: 'Số xe', filterPlaceholder: 'Số xe...' },
  },
  {
    id: 'status',
    accessorFn: (row) => requestStatusLabel(row.status),
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
        requestStatusLabel(row.original.status),
      ),
    width: 144,
    meta: { label: 'Trạng thái', filterPlaceholder: 'Trạng thái...' },
  },
]
