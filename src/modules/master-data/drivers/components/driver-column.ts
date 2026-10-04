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
    accessorKey: 'user_name',
    header: 'Tên đăng nhập',
    cell: ({ row }) => row.original.user_name || '—',
    width: 112,
    meta: { label: 'Tên đăng nhập', filterPlaceholder: 'Tên đăng nhập...' },
  },
  {
    accessorKey: 'partner_name',
    header: 'Đối tác',
    cell: ({ row }) => row.original.partner_name || '—',
    width: 112,
    meta: { label: 'Đối tác', filterPlaceholder: 'Đối tác...' },
  },
  {
    accessorKey: 'type',
    header: 'Loại tài xế',
    cell: ({ row }) => row.original.type || '—',
    width: 112,
    meta: { label: 'Loại tài xế', filterPlaceholder: 'Loại tài xế...' },
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
    accessorKey: 'cccd',
    header: 'CCCD',
    cell: ({ row }) => row.original.cccd || '—',
    width: 112,
    meta: { label: 'CCCD', filterPlaceholder: 'CCCD...' },
  },
  {
    accessorKey: 'license_number',
    header: 'Số GPLX',
    cell: ({ row }) => row.original.license_number || '—',
    width: 112,
    meta: { label: 'Số GPLX', filterPlaceholder: 'Số GPLX...' },
  },
  {
    accessorKey: 'license_class',
    header: 'Hạng GPLX',
    cell: ({ row }) => row.original.license_class || '—',
    width: 112,
    meta: { label: 'Hạng GPLX', filterPlaceholder: 'Hạng GPLX...' },
  },
  {
    accessorKey: 'license_issued_at',
    header: 'Ngày cấp GPLX',
    cell: ({ row }) => row.original.license_issued_at || '—',
    width: 112,
    meta: { label: 'Ngày cấp GPLX', filterPlaceholder: 'Ngày cấp GPLX...' },
  },
  {
    accessorKey: 'license_expired_at',
    header: 'Ngày hết hạn GPLX',
    cell: ({ row }) => row.original.license_expired_at || '—',
    width: 112,
    meta: { label: 'Ngày hết hạn GPLX', filterPlaceholder: 'Ngày hết hạn GPLX...' },
  },
  {
    accessorKey: 'base_salary',
    header: 'Lương cơ bản',
    cell: ({ row }) => row.original.base_salary || '—',
    width: 112,
    meta: { label: 'Lương cơ bản', filterPlaceholder: 'Lương cơ bản...' },
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
