import type { Vehicle } from '@/modules/master-data/master-data.type'
import type { DataGridColumnDef } from '@/shared/components/data-grid'
import { h } from 'vue'

export const vehicleColumns: DataGridColumnDef<Vehicle>[] = [
  { id: 'stt', header: 'STT', cell: ({ row }) => row.index + 1, width: 64, align: 'center', enableSorting: false, enableColumnFilter: false, fixed: 'left', meta: { label: 'STT' } },
  {
    accessorKey: 'is_active', header: 'Trạng thái', width: 120, meta: { label: 'Trạng thái' },
    cell: ({ getValue }) => {
      const active = getValue<boolean | null>() === true
      return h('span', { class: ['inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium', active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'] }, [h('span', { class: ['size-1.5 rounded-full', active ? 'bg-success' : 'bg-muted-foreground'] }), active ? 'Đang hoạt động' : 'Ngừng hoạt động'])
    },
  },
  { accessorKey: 'code', header: 'Mã xe', width: 110, meta: { label: 'Mã xe' } },
  { accessorKey: 'license_plate', header: 'Biển số', width: 145, fixed: 'left', meta: { label: 'Biển số' } },
  { accessorKey: 'vehicle_type_code', header: 'Mã loại xe', width: 130, meta: { label: 'Mã loại xe' } },
  { accessorKey: 'vehicle_type_name', header: 'Loại xe', width: 150, cell: ({ row }) => row.original.vehicle_type_name || 'Cần gán loại xe', meta: { label: 'Loại xe' } },
  { accessorKey: 'default_driver_name', header: 'Tài xế mặc định', width: 190, cell: ({ row }) => row.original.default_driver_name || 'Cần gán tài xế', meta: { label: 'Tài xế mặc định' } },
  { accessorKey: 'note', header: 'Ghi chú', width: 240, cell: ({ row }) => row.original.note || '—', meta: { label: 'Ghi chú' } },
]
