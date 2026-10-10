import type { TripSchedule, TripScheduleStatus } from '../dispatch.types'
import { scheduleStatusLabels } from '../dispatch.format'
import type { DataGridColumnDef } from '@/shared/components/data-grid'
import { h } from 'vue'

const statusClass = (status: TripScheduleStatus) => {
  switch (status) {
    case 'PLANNED':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
    case 'ASSIGNED':
      return 'bg-primary/10 text-primary'
    case 'IN_PROGRESS':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
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

export const scheduleColumns: DataGridColumnDef<TripSchedule>[] = [
  {
    accessorKey: 'schedule_no',
    header: 'Số lịch',
    cell: ({ row }) => h('span', { class: 'font-semibold text-primary tabular-nums' }, row.original.schedule_no),
    width: 130,
    fixed: 'left',
    meta: { label: 'Số lịch', filterPlaceholder: 'Số lịch...' },
  },
  {
    id: 'route',
    accessorFn: (row) => row.route?.name ?? `${row.pickup_location ?? '—'} → ${row.dropoff_location ?? '—'}`,
    header: 'Tuyến / Điểm',
    cell: ({ row }) => {
      const route = row.original.route?.name
      const pickup = row.original.pickup_location
      const dropoff = row.original.dropoff_location
      return h('div', { class: 'truncate' }, [
        h('span', { class: 'font-medium' }, route ?? `${pickup ?? '—'} → ${dropoff ?? '—'}`),
      ])
    },
    width: 220,
    meta: { label: 'Tuyến', filterPlaceholder: 'Tuyến...' },
  },
  {
    id: 'time_range',
    accessorFn: (row) => row.scheduled_start_at,
    header: 'Thời gian',
    cell: ({ row }) =>
      h('div', { class: 'space-y-0.5 tabular-nums' }, [
        h('span', { class: 'text-[13px]' }, formatDatetime(row.original.scheduled_start_at)),
        h('span', { class: 'block text-xs text-muted-foreground' }, formatDatetime(row.original.scheduled_end_at)),
      ]),
    width: 170,
    enableColumnFilter: false,
    meta: { label: 'Thời gian' },
  },
  {
    id: 'assignment',
    accessorFn: (row) => row.assignments?.find((a) => a.is_current)?.vehicle?.license_plate ?? '',
    header: 'Phân công',
    cell: ({ row }) => {
      const current = row.original.assignments?.find((a) => a.is_current)
      if (!current) return h('span', { class: 'text-muted-foreground' }, 'Chưa phân công')
      return h('div', {}, [
        h('span', { class: 'font-medium tabular-nums' }, current.vehicle?.license_plate ?? '—'),
        h('span', { class: 'block text-xs text-muted-foreground' }, current.driver?.full_name ?? '—'),
      ])
    },
    width: 160,
    meta: { label: 'Phân công', filterPlaceholder: 'Biển số...' },
  },
  {
    id: 'customer',
    accessorFn: (row) => row.contract?.customer?.name ?? row.contract?.contract_no ?? '',
    header: 'Khách hàng',
    cell: ({ row }) => row.original.contract?.customer?.name ?? row.original.contract?.contract_no ?? '—',
    width: 180,
    meta: { label: 'Khách hàng', filterPlaceholder: 'Khách hàng...' },
  },
  {
    id: 'status',
    accessorFn: (row) => scheduleStatusLabels[row.status],
    header: 'Trạng thái',
    cell: ({ row }) =>
      h(
        'span',
        {
          class: ['inline-flex rounded-full px-2 py-0.5 text-xs font-semibold', statusClass(row.original.status)],
        },
        scheduleStatusLabels[row.original.status],
      ),
    width: 140,
    meta: { label: 'Trạng thái', filterPlaceholder: 'Trạng thái...' },
  },
]
