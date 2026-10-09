import type { DispatchOrder, DispatchOrderStatus } from '../dispatch.types'
import { orderStatusLabels } from '../dispatch.format'
import type { DataGridColumnDef } from '@/shared/components/data-grid'
import { h } from 'vue'

const statusClass = (status: DispatchOrderStatus) => {
  switch (status) {
    case 'ISSUED':
      return 'bg-primary/10 text-primary'
    case 'ASSIGNED':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
    case 'IN_PROGRESS':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
    case 'PENDING_CONFIRMATION':
      return 'bg-orange-500/10 text-orange-700 dark:text-orange-400'
    case 'COMPLETED':
      return 'bg-success/10 text-success'
    case 'CANCELLED':
      return 'bg-destructive/10 text-destructive'
  }
}

function formatDatetime(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const orderColumns: DataGridColumnDef<DispatchOrder>[] = [
  {
    accessorKey: 'order_no',
    header: 'Mã lệnh',
    cell: ({ row }) => h('span', { class: 'font-semibold text-primary tabular-nums' }, row.original.order_no),
    width: 130,
    fixed: 'left',
    meta: { label: 'Mã lệnh', filterPlaceholder: 'Mã lệnh...' },
  },
  {
    id: 'route',
    accessorFn: (row) => row.trip_schedule?.route?.name ?? row.trip_schedule?.pickup_location ?? '',
    header: 'Tuyến',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'truncate' },
        row.original.trip_schedule?.route?.name ?? row.original.trip_schedule?.pickup_location ?? '—',
      ),
    width: 200,
    meta: { label: 'Tuyến', filterPlaceholder: 'Tuyến...' },
  },
  {
    id: 'vehicle',
    accessorFn: (row) => row.trip_assignment?.vehicle?.license_plate ?? '',
    header: 'Xe',
    cell: ({ row }) =>
      h(
        'span',
        { class: 'font-medium tabular-nums' },
        row.original.trip_assignment?.vehicle?.license_plate ?? '—',
      ),
    width: 130,
    meta: { label: 'Xe', filterPlaceholder: 'Biển số...' },
  },
  {
    id: 'driver',
    accessorFn: (row) => row.trip_assignment?.driver?.full_name ?? '',
    header: 'Tài xế',
    cell: ({ row }) => row.original.trip_assignment?.driver?.full_name ?? '—',
    width: 160,
    meta: { label: 'Tài xế', filterPlaceholder: 'Tài xế...' },
  },
  {
    accessorKey: 'issued_at',
    header: 'Phát hành',
    cell: ({ row }) => h('span', { class: 'tabular-nums' }, formatDatetime(row.original.issued_at)),
    width: 155,
    enableColumnFilter: false,
    meta: { label: 'Phát hành' },
  },
  {
    id: 'status',
    accessorFn: (row) => orderStatusLabels[row.status],
    header: 'Trạng thái',
    cell: ({ row }) =>
      h(
        'span',
        {
          class: ['inline-flex rounded-full px-2 py-0.5 text-xs font-semibold', statusClass(row.original.status)],
        },
        orderStatusLabels[row.original.status],
      ),
    width: 170,
    meta: { label: 'Trạng thái', filterPlaceholder: 'Trạng thái...' },
  },
]
