import type { RouteRecordRaw } from 'vue-router'

export const OrganizationRoute: RouteRecordRaw[] = [
  {
    path: 'users/:id',
    name: 'user-detail',
    component: () => import('@/modules/organization/user/UserDetailPage.vue'),
    meta: { permission: 'users.view', title: 'Chi tiết tài khoản' },
  },
  {
    path: 'roles',
    name: 'roles',
    component: () => import('@/modules/organization/role/RolePage.vue'),
    meta: { permission: 'roles.manage', title: 'Vai trò' },
  },
  {
    path: 'roles/:id',
    name: 'role-detail',
    component: () => import('@/modules/organization/role/RoleDetailPage.vue'),
    meta: { permission: 'roles.manage', title: 'Chi tiết vai trò' },
  },
  {
    path: 'permissions',
    name: 'permissions',
    component: () => import('@/modules/organization/permission/PermissionPage.vue'),
    meta: { permission: 'permissions.view', title: 'Quyền' },
  },
  {
    path: 'users',
    name: 'users',
    component: () => import('@/modules/organization/user/UserPage.vue'),
    meta: { title: 'Tài khoản người dùng' },
  },
]
