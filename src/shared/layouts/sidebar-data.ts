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
  CalendarClockIcon,
  ClipboardListIcon,
  FileTextIcon,
  HandCoinsIcon,
  WalletCardsIcon,
  BarChart3Icon,
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

const unorderedSidebarNavigation: SidebarNavigationNode[] = [
  {
    kind: 'item',
    label: 'Tổng quan',
    to: '/',
    routeName: 'dashboard',
    icon: LayoutDashboardIcon,
  },
  {
    kind: 'group',
    id: 'reports',
    label: 'Báo cáo',
    icon: BarChart3Icon,
    items: [
      {
        kind: 'item',
        label: 'Xe chạy công nhân',
        to: { name: 'report-fixed-trips' },
        routeName: 'report-fixed-trips',
        icon: RouteIcon,
        permission: 'dispatch-orders.view',
      },
      {
        kind: 'item',
        label: 'Xe chạy du lịch',
        to: { name: 'report-tourism-trips' },
        routeName: 'report-tourism-trips',
        icon: BusFrontIcon,
        permission: 'dispatch-orders.view',
      },
      {
        kind: 'item',
        label: 'Công nợ khách hàng',
        to: { name: 'report-customer-debts' },
        routeName: 'report-customer-debts',
        icon: WalletCardsIcon,
        permission: 'receipts.view',
      },
      {
        kind: 'item',
        label: 'Công nợ chủ xe',
        to: { name: 'report-partner-debts' },
        routeName: 'report-partner-debts',
        icon: WalletCardsIcon,
        permission: 'partner-payments.view',
      },
      {
        kind: 'item',
        label: 'Bảng lương lái xe',
        to: { name: 'report-driver-payroll' },
        routeName: 'report-driver-payroll',
        icon: ClipboardListIcon,
        permission: 'payrolls.view',
      },
      {
        kind: 'item',
        label: 'Lợi nhuận theo tháng',
        to: { name: 'report-profit-loss' },
        routeName: 'report-profit-loss',
        icon: BarChart3Icon,
        permissionsAll: [
          'dispatch-orders.view',
          'expenses.view',
          'partner-payments.view',
          'payrolls.view',
        ],
      },
      {
        kind: 'item',
        label: 'Lợi nhuận xe',
        to: { name: 'report-vehicle-profit' },
        routeName: 'report-vehicle-profit',
        icon: BarChart3Icon,
        permissionsAll: [
          'dispatch-orders.view',
          'expenses.view',
          'partner-payments.view',
          'payrolls.view',
        ],
      },
    ],
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
        roles: ['driver'],
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
    ],
  },
  {
    kind: 'group',
    id: 'organization',
    label: 'Quản lý hệ thống',
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
        icon: WalletCardsIcon,
        permission: 'receipts.view',
      },
      {
        kind: 'item',
        label: 'Chấm công và lương',
        to: { name: 'driver-payroll' },
        routeName: 'driver-payroll',
        icon: ClipboardListIcon,
        permission: 'driver-advances.view',
      },
    ],
  },
]

const sidebarGroupOrder = [
  'organization',
  'dashboard',
  'rental',
  'dispatch',
  'driver-workspace',
  'finance',
  'master-data',
  'reports',
]

const masterDataOrder = [
  'customers',
  'partners',
  'vehicle-types',
  'vehicles',
  'drivers',
  'routes',
  'expense-types',
]

const navigationOrder = (node: SidebarNavigationNode) =>
  node.kind === 'item'
    ? sidebarGroupOrder.indexOf(node.routeName)
    : sidebarGroupOrder.indexOf(node.id)

export const sidebarNavigation: SidebarNavigationNode[] = unorderedSidebarNavigation
  .map((node) => {
    if (node.kind !== 'group' || node.id !== 'master-data') return node

    return {
      ...node,
      items: node.items
        .filter(
          (item, index, items) =>
            item.routeName !== 'routes' ||
            items.findIndex(({ routeName }) => routeName === item.routeName) === index,
        )
        .sort(
          (a, b) => masterDataOrder.indexOf(a.routeName) - masterDataOrder.indexOf(b.routeName),
        ),
    }
  })
  .sort((a, b) => navigationOrder(a) - navigationOrder(b))
