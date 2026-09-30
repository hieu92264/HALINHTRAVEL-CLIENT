import type { UserRow } from '@/services/user.service'
import type { DataGridColumnDef } from '@/shared/components/data-grid'

export const userColumns: DataGridColumnDef<UserRow>[] = [
  {
    id: 'stt',
    header: 'STT',
    cell: ({ row }) => row.index + 1,
    size: 64,
    enableSorting: false,
    enableColumnFilter: false,
    meta: { label: 'STT' },
  },
  {
    accessorKey: 'user_name',
    header: 'Tên đăng nhập',
    cell: ({ row }) => row.original.user_name || row.original.name || '—',
    meta: { label: 'Tên đăng nhập', filterPlaceholder: 'Lọc tên đăng nhập' },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ getValue }) => (getValue() as string | null) || '—',
    meta: { label: 'Email', filterPlaceholder: 'Lọc email' },
  },
  {
    accessorKey: 'roles',
    header: 'Vai trò',
    cell: ({ getValue }) => {
      const roles = getValue() as UserRow['roles']
      return (
        roles
          ?.map((role) => (typeof role === 'string' ? role : role.name || ''))
          .filter(Boolean)
          .join(', ') || '—'
      )
    },
    enableColumnFilter: false,
    meta: { label: 'Vai trò' },
  },
  {
    accessorKey: 'is_active',
    header: 'Trạng thái',
    size: 120,
    cell: ({ getValue }) => (getValue() as boolean | null) ? 'Hoạt động' : 'Vô hiệu',
    enableColumnFilter: false,
    meta: { label: 'Trạng thái' },
  },
  {
    accessorKey: 'created_at',
    header: 'Ngày tạo',
    cell: ({ getValue }) => (getValue() as string | null) || '—',
    meta: { label: 'Ngày tạo' },
  },
]
