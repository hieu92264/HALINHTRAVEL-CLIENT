import { computed, ref, watch } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { UserService } from '@/services/user.service'
import { RoleService } from '@/services/role.service'
import { PermissionService, type PermissionRow } from '@/services/permission.service'
import { useAuthStore } from '@/modules/auth/auth.store'
import { userQueryKeys } from './useUserQueries'

export interface PermissionGroup {
  prefix: string
  permissions: PermissionRow[]
}

export function useUserDetail(id: string) {
  const auth = useAuthStore()
  const client = useQueryClient()

  /* ---------- Queries ---------- */
  const userQuery = useQuery({
    queryKey: [...userQueryKeys.all, id],
    queryFn: () => UserService.getUser(id),
  })

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: RoleService.getRoles,
    enabled: () => auth.user?.permissions.includes('roles.manage') ?? false,
  })

  const permissionsQuery = useQuery({
    queryKey: ['permissions'],
    queryFn: PermissionService.getPermissions,
    enabled: () => auth.user?.permissions.includes('permissions.view') ?? false,
  })

  /* ---------- Local state ---------- */
  const roleIds = ref<number[]>([])
  const permissionIds = ref<number[]>([])
  const permissionSearch = ref('')
  const roleSearch = ref('')

  /* Sync từ server data khi queries load xong */
  watch(
    [() => userQuery.data.value, () => rolesQuery.data.value, () => permissionsQuery.data.value],
    ([user, roles, permissions]) => {
      if (!user) return
      if (roles) {
        roleIds.value = roles
          .filter((r) => user.roles?.includes(r.name))
          .map((r) => r.id)
      }
      if (permissions) {
        permissionIds.value = permissions
          .filter((p) => user.direct_permissions?.includes(p.name))
          .map((p) => p.id)
      }
    },
    { immediate: true },
  )

  /* ---------- Computed ---------- */
  const user = computed(() => userQuery.data.value)

  const activeRoles = computed(() =>
    (rolesQuery.data.value ?? []).filter((r) => r.is_active),
  )

  const filteredRoles = computed(() => {
    const q = roleSearch.value.trim().toLowerCase()
    return q ? activeRoles.value.filter((r) => r.name.toLowerCase().includes(q)) : activeRoles.value
  })

  const rolePermissionNames = computed(() => {
    const directPermissions = new Set(user.value?.direct_permissions ?? [])
    return new Set((user.value?.permissions ?? []).filter((name) => !directPermissions.has(name)))
  })

  /** Permission được nhóm theo prefix (phần trước dấu chấm đầu tiên) */
  const groupedPermissions = computed<PermissionGroup[]>(() => {
    const all = (permissionsQuery.data.value ?? [])
      .filter((p) => p.is_active)
      .filter((p) => !rolePermissionNames.value.has(p.name))
    const q = permissionSearch.value.trim().toLowerCase()
    const filtered = q ? all.filter((p) => p.name.toLowerCase().includes(q)) : all

    const map = new Map<string, PermissionRow[]>()
    for (const p of filtered) {
      const dotIdx = p.name.indexOf('.')
      const prefix = dotIdx > -1 ? p.name.slice(0, dotIdx) : p.name
      if (!map.has(prefix)) map.set(prefix, [])
      map.get(prefix)!.push(p)
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([prefix, permissions]) => ({ prefix, permissions }))
  })

  /* ---------- Mutations ---------- */
  const syncRoles = useMutation({
    mutationFn: () => UserService.syncRoles(id, roleIds.value),
    onSuccess: async () => {
      toast.success('Đã cập nhật vai trò.')
      await client.invalidateQueries({ queryKey: userQueryKeys.all })
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Không thể lưu vai trò.'),
  })

  const syncPermissions = useMutation({
    mutationFn: () => UserService.syncPermissions(id, permissionIds.value),
    onSuccess: async () => {
      toast.success('Đã cập nhật quyền ngoại lệ.')
      await client.invalidateQueries({ queryKey: userQueryKeys.all })
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Không thể lưu quyền.'),
  })

  /* ---------- Helpers ---------- */
  function toggleRole(rid: number) {
    const i = roleIds.value.indexOf(rid)
    if (i < 0) roleIds.value.push(rid)
    else roleIds.value.splice(i, 1)
  }

  function togglePermission(pid: number) {
    const i = permissionIds.value.indexOf(pid)
    if (i < 0) permissionIds.value.push(pid)
    else permissionIds.value.splice(i, 1)
  }

  return {
    /* queries */
    userQuery,
    rolesQuery,
    permissionsQuery,
    /* data */
    user,
    activeRoles,
    filteredRoles,
    groupedPermissions,
    /* state */
    roleIds,
    permissionIds,
    permissionSearch,
    roleSearch,
    /* mutations */
    syncRoles,
    syncPermissions,
    /* helpers */
    toggleRole,
    togglePermission,
  }
}
