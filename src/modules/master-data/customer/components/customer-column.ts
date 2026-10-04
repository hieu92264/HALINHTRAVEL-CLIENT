import { h } from 'vue'
import type { Customer } from '@/modules/master-data/master-data.type'
import type { DataGridColumnDef } from '@/shared/components/data-grid'

export const customerColumns: DataGridColumnDef<Customer>[] = [
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
    header: 'Mã khách hàng',
    cell: ({ row }) => row.original.code || '—',
    width: 112,
    meta: { label: 'Mã khách hàng', filterPlaceholder: 'Mã khách hàng...' },
  },
  {
    accessorKey: 'name',
    header: 'Tên khách hàng',
    cell: ({ row }) => row.original.name || '—',
    width: 176,
    meta: { label: 'Tên khách hàng', filterPlaceholder: 'Tên khách hàng...' },
  },
  {
    accessorKey: 'type',
    header: 'Loại khách hàng',
    cell: ({ row }) => row.original.type || '—',
    width: 150,
    meta: { label: 'Loại khách hàng', filterPlaceholder: 'Loại khách hàng...' },
  },
  {
    accessorKey: 'phone',
    header: 'Số điện thoại',
    cell: ({ row }) => row.original.phone || '—',
    width: 148,
    meta: { label: 'Số điện thoại', filterPlaceholder: 'Số điện thoại...' },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.email || '—',
    width: 220,
    meta: { label: 'Email', filterPlaceholder: 'Email...' },
  },
  {
    accessorKey: 'cccd',
    header: 'CCCD',
    cell: ({ row }) => row.original.cccd || '—',
    width: 152,
    meta: { label: 'CCCD', filterPlaceholder: 'CCCD...' },
  },
  {
    accessorKey: 'tax_code',
    header: 'Mã số thuế',
    cell: ({ row }) => row.original.tax_code || '—',
    width: 150,
    meta: { label: 'Mã số thuế', filterPlaceholder: 'Mã số thuế...' },
  },
  {
    accessorKey: 'address',
    header: 'Địa chỉ',
    cell: ({ row }) => row.original.address || '—',
    width: 220,
    meta: { label: 'Địa chỉ', filterPlaceholder: 'Địa chỉ...' },
  },
  {
    accessorKey: 'contact_name',
    header: 'Người liên hệ',
    cell: ({ row }) => row.original.contact_name || '—',
    width: 160,
    meta: { label: 'Người liên hệ', filterPlaceholder: 'Người liên hệ...' },
  },
  {
    accessorKey: 'opening_balance',
    header: 'Số dư đầu kỳ',
    cell: ({ row }) => row.original.opening_balance || '0',
    width: 128,
    align: 'right',
    meta: { label: 'Số dư đầu kỳ', filterPlaceholder: 'Số dư đầu kỳ...' },
  },
]
