import {
  BarChart3Icon,
  Building2Icon,
  BusFrontIcon,
  CalendarClockIcon,
  CircleUserRoundIcon,
  HandCoinsIcon,
  HandshakeIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  ListTreeIcon,
  MapPinnedIcon,
  ShieldCheckIcon,
  UsersIcon,
} from '@lucide/vue'
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

export type SidebarLeaf = {
  kind: 'item'
  label: string
  to: RouteLocationRaw
  routeName: string
  icon: Component
  permission?: string
  permissionsAll?: string[]
  roles?: string[]
}
export type SidebarGroup = {
  kind: 'group'
  id: string
  label: string
  icon: Component
  items: SidebarLeaf[]
}
export type SidebarNavigationNode = SidebarLeaf | SidebarGroup

export const sidebarNavigation: SidebarNavigationNode[] = [
  { kind: 'item', label: 'Tổng quan', to: '/', routeName: 'dashboard', icon: LayoutDashboardIcon },
  {
    kind: 'group',
    id: 'operations',
    label: 'Quản lý chạy xe',
    icon: CalendarClockIcon,
    items: [
      {
        kind: 'item',
        label: 'Xe chạy công nhân',
        to: { name: 'worker-vehicles' },
        routeName: 'worker-vehicles',
        icon: BusFrontIcon,
        permission: 'worker-vehicles.view',
      },
      {
        kind: 'item',
        label: 'Xe chạy du lịch',
        to: { name: 'tourist-vehicles' },
        routeName: 'tourist-vehicles',
        icon: BusFrontIcon,
        permission: 'tourist-vehicles.view',
      },
    ],
  },
  {
    kind: 'group',
    id: 'master-data',
    label: 'Quản lý danh mục',
    icon: ListTreeIcon,
    items: [
      {
        kind: 'item',
        label: 'Khách hàng',
        to: '/customers',
        routeName: 'customers',
        icon: UsersIcon,
        permission: 'customers.view',
      },
      {
        kind: 'item',
        label: 'Đối tác',
        to: '/partners',
        routeName: 'partners',
        icon: HandshakeIcon,
        permission: 'partners.view',
      },
      {
        kind: 'item',
        label: 'Tài xế',
        to: '/drivers',
        routeName: 'drivers',
        icon: BusFrontIcon,
        permission: 'drivers.view',
      },
      {
        kind: 'item',
        label: 'Tuyến đường',
        to: '/routes',
        routeName: 'routes',
        icon: MapPinnedIcon,
        permission: 'routes.view',
      },
      {
        kind: 'item',
        label: 'Loại chi phí',
        to: '/expense-types',
        routeName: 'expense-types',
        icon: ListTreeIcon,
        permission: 'expense-types.view',
      },
    ],
  },
  {
    kind: 'group',
    id: 'finance',
    label: 'Tài chính và nhân sự',
    icon: HandCoinsIcon,
    items: [
      {
        kind: 'item',
        label: 'Thu chi và công nợ',
        to: { name: 'finance' },
        routeName: 'finance',
        icon: HandCoinsIcon,
        permission: 'receipts.view',
      },
      {
        kind: 'item',
        label: 'Chấm công và lương',
        to: { name: 'driver-payroll' },
        routeName: 'driver-payroll',
        icon: CalendarClockIcon,
        permission: 'driver-attendances.view',
      },
    ],
  },
  {
    kind: 'item',
    label: 'Báo cáo',
    to: { name: 'reports' },
    routeName: 'reports',
    icon: BarChart3Icon,
    permission: 'payrolls.view',
  },
  {
    kind: 'group',
    id: 'organization',
    label: 'Quản lý hệ thống',
    icon: Building2Icon,
    items: [
      {
        kind: 'item',
        label: 'Quản lý người dùng',
        to: '/users',
        routeName: 'users',
        icon: UsersIcon,
        permission: 'users.view',
      },
      {
        kind: 'item',
        label: 'Quản lý vai trò',
        to: '/roles',
        routeName: 'roles',
        icon: ShieldCheckIcon,
        permission: 'roles.manage',
      },
      {
        kind: 'item',
        label: 'Quản lý phân quyền',
        to: '/permissions',
        routeName: 'permissions',
        icon: KeyRoundIcon,
        permission: 'permissions.view',
      },
      {
        kind: 'item',
        label: 'Đổi mật khẩu',
        to: { name: 'change-password' },
        routeName: 'change-password',
        icon: CircleUserRoundIcon,
      },
    ],
  },
]
