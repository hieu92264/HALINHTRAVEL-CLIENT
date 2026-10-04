import type { VehicleType } from '@/modules/master-data/master-data.type'
import type { DataGridColumnDef } from '@/shared/components/data-grid'
import { h } from 'vue'

export const vehicleTypeColumns: DataGridColumnDef<VehicleType>[] = [
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
    header: 'Mã loại xe',
    cell: ({ row }) => row.original.code || '—',
    width: 112,
    meta: { label: 'Mã loại xe', filterPlaceholder: 'Mã loại xe...' },
  },
  {
    accessorKey: 'name',
    header: 'Tên loại xe',
    cell: ({ row }) => row.original.name || '—',
    width: 176,
    meta: { label: 'Tên loại xe', filterPlaceholder: 'Tên loại xe...' },
  },
  {
    accessorKey: 'seats',
    header: 'Số chỗ ngồi',
    cell: ({ row }) => row.original.seats || '—',
    width: 176,
    meta: { label: 'Số chỗ ngồi', filterPlaceholder: 'Số chỗ ngồi...' },
  },
  {
    accessorKey: 'tour_driver_commission_rate',
    header: 'Tỷ lệ hoa hồng tài xế',
    cell: ({ row }) => row.original.tour_driver_commission_rate || '—',
    width: 176,
    meta: { label: 'Tỷ lệ hoa hồng tài xế', filterPlaceholder: 'Tỷ lệ hoa hồng tài xế...' },
  },
]
