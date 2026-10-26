import { describe, expect, it } from 'vitest'
import { permissionGroupLabel, permissionLabel, roleLabel } from './access-labels'

describe('Nhãn quyền và vai trò', () => {
  it('hiển thị tên quyền và nhóm quyền hệ thống bằng tiếng Việt', () => {
    expect(permissionGroupLabel('dispatch-orders')).toBe('Lệnh điều xe')
    expect(permissionLabel('customers.view')).toBe('Xem khách hàng')
    expect(permissionLabel('driver-advances.manage')).toBe('Quản lý tạm ứng tài xế')
  })
  it('giữ mã tùy chỉnh và không nhầm các quyền khác nhau', () => {
    expect(permissionLabel('custom.approve')).toBe('custom.approve')
    expect(permissionLabel('customers.export')).toBe('customers.export')
    expect(permissionLabel('customers.view')).not.toBe(permissionLabel('customers.manage'))
    expect(roleLabel('sales')).toBe('Nhân viên kinh doanh')
    expect(roleLabel('admin2')).toBe('admin2')
  })
})