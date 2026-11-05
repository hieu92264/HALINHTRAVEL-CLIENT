import type { Driver } from '@/modules/master-data/master-data.type'
import type { DataGridColumnDef } from '@/shared/components/data-grid'
import { h } from 'vue'

export const driverColumns: DataGridColumnDef<Driver>[] = [
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
    header: 'Mã tài xế',
    cell: ({ row }) => row.original.code || '—',
    width: 112,
    meta: { label: 'Mã tài xế', filterPlaceholder: 'Mã tài xế...' },
  },
  {
    accessorKey: 'full_name',
    header: 'Họ và tên',
    cell: ({ row }) => row.original.full_name || '—',
    width: 112,
    meta: { label: 'Họ và tên', filterPlaceholder: 'Họ và tên...' },
  },
  {
    accessorKey: 'phone',
    header: 'Số điện thoại',
    cell: ({ row }) => row.original.phone || '—',
    width: 112,
    meta: { label: 'Số điện thoại', filterPlaceholder: 'Số điện thoại...' },
  },
  {
    accessorKey: 'responsibility_allowance',
    header: 'Phụ cấp trách nhiệm',
    cell: ({ row }) => row.original.responsibility_allowance || '—',
    width: 112,
    meta: { label: 'Phụ cấp trách nhiệm', filterPlaceholder: 'Phụ cấp trách nhiệm...' },
  },
  {
    accessorKey: 'joined_at',
    header: 'Ngày vào làm',
    cell: ({ row }) => row.original.joined_at || '—',
    width: 112,
    meta: { label: 'Ngày vào làm', filterPlaceholder: 'Ngày vào làm...' },
  },
  {
    accessorKey: 'left_at',
    header: 'Ngày nghỉ việc',
    cell: ({ row }) => row.original.left_at || '—',
    width: 112,
    meta: { label: 'Ngày nghỉ việc', filterPlaceholder: 'Ngày nghỉ việc...' },
  },
]
