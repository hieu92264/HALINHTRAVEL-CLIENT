import type { Route } from '@/modules/master-data/master-data.type'
import type { DataGridColumnDef } from '@/shared/components/data-grid'
import { h } from 'vue'

export const routeColumns: DataGridColumnDef<Route>[] = [
  {
    id: 'stt',
    header: 'STT',
    cell: ({ row }) => row.index + 1,
    width: 64,
    align: 'center',
    enableSorting: false,
    enableColumnFilter: false,
    fixed: 'left',
    meta: { label: 'STT' },
  },
  {
    accessorKey: 'is_active',
    header: 'Trạng thái',
    cell: ({ getValue }) => {
      const isActive = getValue<boolean | null>() === true

      return h(
        'span',
        {
          class: [
            'inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium',
            isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground',
          ],
        },
        [
          h('span', {
            class: ['size-1.5 rounded-full', isActive ? 'bg-success' : 'bg-muted-foreground'],
          }),
          isActive ? 'Đang hoạt động' : 'Vô hiệu hóa',
        ],
      )
    },
    width: 120,
    meta: { label: 'Trạng thái', filterPlaceholder: 'Trạng thái...' },
  },
  {
    accessorKey: 'code',
    header: 'Mã tuyến đường',
    cell: ({ row }) => row.original.code || '—',
    width: 112,
    meta: { label: 'Mã tuyến đường', filterPlaceholder: 'Mã tuyến đường...' },
  },
  {
    accessorKey: 'customer_name',
    header: 'Tên khách hàng',
    cell: ({ row }) => row.original.customer_name || '—',
    width: 112,
    meta: { label: 'Tên khách hàng', filterPlaceholder: 'Tên khách hàng...' },
  },
  {
    accessorKey: 'name',
    header: 'Tên tuyến đường',
    cell: ({ row }) => row.original.name || '—',
    width: 112,
    meta: { label: 'Tên tuyến đường', filterPlaceholder: 'Tên tuyến đường...' },
  },
  {
    accessorKey: 'shift_name',
    header: 'Ca làm việc',
    cell: ({ row }) => row.original.shift_name || '—',
    width: 112,
    meta: { label: 'Ca làm việc', filterPlaceholder: 'Ca làm việc...' },
  },
  {
    accessorKey: 'pickup_location',
    header: 'Điểm đón',
    cell: ({ row }) => row.original.pickup_location || '—',
    width: 112,
    meta: { label: 'Điểm đón', filterPlaceholder: 'Điểm đón...' },
  },
  {
    accessorKey: 'dropoff_location',
    header: 'Điểm trả',
    cell: ({ row }) => row.original.dropoff_location || '—',
    width: 112,
    meta: { label: 'Điểm trả', filterPlaceholder: 'Điểm trả...' },
  },
  {
    accessorKey: 'default_pickup_time',
    header: 'Thời gian đón',
    cell: ({ row }) => row.original.default_pickup_time || '—',
    width: 112,
    meta: { label: 'Thời gian đón', filterPlaceholder: 'Thời gian đón...' },
  },
  {
    accessorKey: 'default_return_time',
    header: 'Thời gian trả',
    cell: ({ row }) => row.original.default_return_time || '—',
    width: 112,
    meta: { label: 'Thời gian trả', filterPlaceholder: 'Thời gian trả...' },
  },
  {
    accessorKey: 'estimated_distance_km',
    header: 'Khoảng cách (km)',
    cell: ({ row }) => row.original.estimated_distance_km || '—',
    width: 112,
    meta: { label: 'Khoảng cách (km)', filterPlaceholder: 'Khoảng cách (km)...' },
  },
]
