import type { ExpenseType } from '@/modules/master-data/master-data.type'
import type { DataGridColumnDef } from '@/shared/components/data-grid'
import { h } from 'vue'

export const expenseTypeColumn: DataGridColumnDef<ExpenseType>[] = [
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
    header: 'Mã loại chi phí',
    cell: ({ row }) => row.original.code || '—',
    width: 112,
    meta: { label: 'Mã loại chi phí', filterPlaceholder: 'Mã loại chi phí...' },
  },
  {
    accessorKey: 'name',
    header: 'Tên loại chi phí',
    cell: ({ row }) => row.original.name || '—',
    width: 112,
    meta: { label: 'Tên loại chi phí', filterPlaceholder: 'Tên loại chi phí...' },
  },
  {
    accessorKey: 'scope',
    header: 'Phạm vi',
    cell: ({ row }) => row.original.scope || '—',
    width: 112,
    meta: { label: 'Phạm vi', filterPlaceholder: 'Phạm vi...' },
  },
]
