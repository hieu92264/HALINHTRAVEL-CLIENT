import type { Vehicle } from '@/modules/master-data/master-data.type'
import type { DataGridColumnDef } from '@/shared/components/data-grid'
import { h } from 'vue'

export const vehicleColumns: DataGridColumnDef<Vehicle>[] = [
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
    accessorKey: 'license_plate',
    header: 'Biển số xe',
    cell: ({ row }) => row.original.license_plate || '—',
    width: 112,
    meta: { label: 'Biển số xe', filterPlaceholder: 'Biển số xe...' },
  },
  {
    accessorKey: 'vehicle_type_name',
    header: 'Loại xe',
    cell: ({ row }) => row.original.vehicle_type_name || '—',
    width: 112,
    meta: { label: 'Loại xe', filterPlaceholder: 'Loại xe...' },
  },
  {
    accessorKey: 'ownership_type',
    header: 'Loại sở hữu',
    cell: ({ row }) => row.original.ownership_type || '—',
    width: 112,
    meta: { label: 'Loại sở hữu', filterPlaceholder: 'Loại sở hữu...' },
  },
  {
    accessorKey: 'partner_name',
    header: 'Đối tác',
    cell: ({ row }) => row.original.partner_name || '—',
    width: 112,
    meta: { label: 'Đối tác', filterPlaceholder: 'Đối tác...' },
  },
  {
    accessorKey: 'brand',
    header: 'Nhãn hàng',
    cell: ({ row }) => row.original.brand || '—',
    width: 112,
    meta: { label: 'Nhãn hàng', filterPlaceholder: 'Nhãn hàng...' },
  },
  {
    accessorKey: 'model',
    header: 'Mẫu xe',
    cell: ({ row }) => row.original.model || '—',
    width: 112,
    meta: { label: 'Mẫu xe', filterPlaceholder: 'Mẫu xe...' },
  },
  {
    accessorKey: 'manufacture_year',
    header: 'Năm sản xuất',
    cell: ({ row }) => row.original.manufacture_year || '—',
    width: 112,
    meta: { label: 'Năm sản xuất', filterPlaceholder: 'Năm sản xuất...' },
  },
  {
    accessorKey: 'current_odometer',
    header: 'Số km hiện tại',
    cell: ({ row }) => row.original.current_odometer || '—',
    width: 112,
    meta: { label: 'Số km hiện tại', filterPlaceholder: 'Số km hiện tại...' },
  },
  {
    accessorKey: 'vehicle_status',
    header: 'Trạng thái xe',
    cell: ({ row }) => row.original.vehicle_status || '—',
    width: 112,
    meta: { label: 'Trạng thái xe', filterPlaceholder: 'Trạng thái xe...' },
  },
  {
    accessorKey: 'notes',
    header: 'Ghi chú',
    cell: ({ row }) => row.original.notes || '—',
    width: 112,
    meta: { label: 'Ghi chú', filterPlaceholder: 'Ghi chú...' },
  },
]
