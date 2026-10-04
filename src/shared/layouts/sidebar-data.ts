import {
  BusFrontIcon,
  HandshakeIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  TagIcon,
  UsersIcon,
} from '@lucide/vue'
import type { Component } from 'vue'

export type SidebarLeaf = {
  kind: 'item'
  label: string
  to: string
  routeName: string
  icon: Component
  permission?: string
}

export type SidebarGroup = {
  kind: 'group'
  label: string
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
    label: 'Quản lý danh mục',
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
        label: 'Tài xế',
        to: '/drivers',
        routeName: 'drivers',
        icon: BusFrontIcon,
        permission: 'drivers.view',
      },
    ],
  },
  {
    kind: 'group',
    label: 'Quản lý tổ chức',
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
]
