const groups: Record<string, string> = {
  users: 'Tài khoản',
  roles: 'Vai trò',
  permissions: 'Quyền',
  customers: 'Khách hàng',
  partners: 'Đối tác',
  'vehicle-types': 'Loại xe',
  vehicles: 'Xe',
  drivers: 'Tài xế',
  routes: 'Tuyến đường',
  'route-rates': 'Giá tuyến',
  'expense-types': 'Loại chi phí',
  'rental-requests': 'Yêu cầu thuê xe',
  quotations: 'Báo giá',
  contracts: 'Hợp đồng',
  'rental-capacity': 'Năng lực xe',
  'trip-schedules': 'Lịch chuyến',
  'trip-assignments': 'Phân công chuyến',
  'dispatch-orders': 'Lệnh điều xe',
  'my-dispatch-orders': 'Lệnh điều xe của tôi',
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
