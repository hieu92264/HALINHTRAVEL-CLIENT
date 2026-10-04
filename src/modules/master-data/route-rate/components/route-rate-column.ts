import type { RouteRate } from '@/modules/master-data/master-data.type'
import type { DataGridColumnDef } from '@/shared/components/data-grid'
import { h } from 'vue'

export const routeRateColumns: DataGridColumnDef<RouteRate>[] = [
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
    accessorKey: 'route_name',
    header: 'Tên tuyến',
    cell: ({ row }) => row.original.route_name || '—',
    width: 112,
    meta: { label: 'Tên tuyến', filterPlaceholder: 'Tên tuyến...' },
  },
  {
    accessorKey: 'vehicle_type_name',
    header: 'Loại xe',
    cell: ({ row }) => row.original.vehicle_type_name || '—',
    width: 112,
    meta: { label: 'Loại xe', filterPlaceholder: 'Loại xe...' },
  },
  {
    accessorKey: 'customer_price',
    header: 'Giá khách',
    cell: ({ row }) => row.original.customer_price || '—',
    width: 112,
    meta: { label: 'Giá khách', filterPlaceholder: 'Giá khách...' },
  },
  {
    accessorKey: 'driver_wage',
    header: 'Lương tài xế',
    cell: ({ row }) => row.original.driver_wage || '—',
    width: 112,
    meta: { label: 'Lương tài xế', filterPlaceholder: 'Lương tài xế...' },
  },
  {
    accessorKey: 'effective_from',
    header: 'Hiệu lực từ',
    cell: ({ row }) => row.original.effective_from || '—',
    width: 112,
    meta: { label: 'Hiệu lực từ', filterPlaceholder: 'Hiệu lực từ...' },
  },
  {
    accessorKey: 'effective_to',
    header: 'Hiệu lực đến',
    cell: ({ row }) => row.original.effective_to || '—',
    width: 112,
    meta: { label: 'Hiệu lực đến', filterPlaceholder: 'Hiệu lực đến...' },
  },
]
