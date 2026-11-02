const groups: Record<string, string> = {
  users: 'Tài khoản',
  roles: 'Vai trò',
  permissions: 'Quyền',
  customers: 'Khách hàng',
  partners: 'Đối tác',
  drivers: 'Tài xế',
  routes: 'Tuyến đường',
  'expense-types': 'Loại chi phí',
  'worker-vehicles': 'Xe chạy công nhân',
  'worker-vehicle-schedules': 'Lịch xe công nhân',
  'worker-vehicle-rates': 'Bảng giá xe công nhân',
  'tourist-vehicles': 'Xe chạy du lịch',
  receipts: 'Phiếu thu',
  expenses: 'Phiếu chi',
  'partner-payments': 'Thanh toán đối tác',
  'driver-attendances': 'Chấm công tài xế',
  'driver-advances': 'Tạm ứng tài xế',
  payrolls: 'Kỳ lương',
  attachments: 'Tệp đính kèm',
}
const roles: Record<string, string> = {
  admin: 'Quản trị viên',
  director: 'Ban giám đốc',
  sales: 'Nhân viên kinh doanh',
  dispatcher: 'Nhân viên điều hành',
  accountant: 'Kế toán',
  driver: 'Tài xế',
}
export const roleLabel = (name: string) => roles[name] ?? name
export const permissionGroupLabel = (prefix: string) => groups[prefix] ?? prefix
export function permissionLabel(name: string): string {
  const [group, action, ...rest] = name.split('.')
  if (rest.length || !group || !action || !groups[group] || !['view', 'manage'].includes(action))
    return name
  return `${action === 'view' ? 'Xem' : 'Quản lý'} ${groups[group]!.toLocaleLowerCase('vi-VN')}`
}

/** Display a user-friendly permission label while retaining its technical code for reference. */
export function permissionDisplayLabel(name: string): string {
  const label = permissionLabel(name)

  return label === name ? name : `${label} (${name})`
}
