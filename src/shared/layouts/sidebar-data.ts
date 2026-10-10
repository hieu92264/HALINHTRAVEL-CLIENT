import {
  BusFrontIcon,
  CarIcon,
  Building2Icon,
  HandshakeIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  ListTreeIcon,
  MapPinnedIcon,
  ShieldCheckIcon,
  TagIcon,
  UsersIcon,
  BadgeDollarSignIcon,
  RouteIcon,
  CircleDollarSignIcon,
  CalendarClockIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  FileTextIcon,
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
  {
    kind: 'item',
    label: 'Tổng quan',
    to: '/',
    routeName: 'dashboard',
    icon: LayoutDashboardIcon,
  },
  {
    kind: 'group',
    id: 'dispatch',
    label: 'Điều hành',
    icon: CalendarClockIcon,
    items: [
      {
        kind: 'item',
        label: 'Lịch chuyến',
        to: '/trip-schedules',
        routeName: 'trip-schedules',
        icon: CalendarClockIcon,
        permission: 'trip-schedules.view',
      },
      {
        kind: 'item',
        label: 'Kiểm tra năng lực',
        to: '/capacity',
        routeName: 'rental-capacity',
        icon: ClipboardCheckIcon,
        permission: 'rental-capacity.view',
      },
      {
        kind: 'item',
        label: 'Lệnh điều xe',
        to: '/dispatch-orders',
        routeName: 'dispatch-orders',
        icon: FileTextIcon,
        permission: 'dispatch-orders.view',
      },
    ],
  },
  {
    kind: 'group',
    id: 'driver-workspace',
    label: 'Không gian tài xế',
    icon: BusFrontIcon,
    items: [
      {
        kind: 'item',
        label: 'Lệnh của tôi',
        to: '/my-dispatch-orders',
        routeName: 'my-dispatch-orders',
        icon: FileTextIcon,
        permission: 'my-dispatch-orders.view',
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
        label: 'Phân loại xe',
        to: '/vehicle-types',
        routeName: 'vehicle-types',
        icon: TagIcon,
        permission: 'vehicle-types.view',
      },
      {
        kind: 'item',
        label: 'Danh sách xe',
        to: '/vehicles',
        routeName: 'vehicles',
        icon: CarIcon,
        permission: 'vehicles.view',
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
        label: 'Tuyến xe',
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
        icon: BadgeDollarSignIcon,
        permission: 'expense-types.view',
      },
      {
        kind: 'item',
        label: 'Tuyến đường',
        to: '/routes',
        routeName: 'routes',
        icon: RouteIcon,
        permission: 'routes.view',
      },
      {
        kind: 'item',
        label: 'Bảng giá tuyến xe',
        to: '/route-rates',
        routeName: 'route-rates',
        icon: CircleDollarSignIcon,
        permission: 'route-rates.view',
      },
    ],
  },
  {
    kind: 'group',
    id: 'organization',
    label: 'Quản lý tổ chức',
    icon: Building2Icon,
    items: [
      {
        kind: 'item',
        label: 'Tài khoản',
        to: '/users',
        routeName: 'users',
        icon: UsersIcon,
        permission: 'users.view',
      },
      {
        kind: 'item',
        label: 'Vai trò',
        to: '/roles',
        routeName: 'roles',
        icon: ShieldCheckIcon,
        permission: 'roles.manage',
      },
      {
        kind: 'item',
        label: 'Quyền',
        to: '/permissions',
        routeName: 'permissions',
        icon: KeyRoundIcon,
        permission: 'permissions.view',
      },
    ],
  },
  {
    kind: 'group',
    id: 'rental',
    label: 'Thuê xe',
    icon: CarIcon,
    items: [
      {
        kind: 'item',
        label: 'Yêu cầu thuê xe',
        to: { name: 'rental-requests' },
        routeName: 'rental-requests',
        icon: ClipboardListIcon,
        permission: 'rental-requests.view',
      },
      {
        kind: 'item',
        label: 'Báo giá',
        to: '/quotations',
        routeName: 'quotations',
        icon: FileTextIcon,
        permission: 'quotations.view',
      },
      {
        kind: 'item',
        label: 'Hợp đồng',
        to: { name: 'contracts' },
        routeName: 'contracts',
        icon: FileTextIcon,
        permission: 'contracts.view',
      },
    ],
  },
]
