import { httpService } from './http.service'

export type PermissionRow = {
  id: number
  name: string
  guard_name: string
  is_active: boolean
  is_system: boolean
  created_at: string | null
  updated_at: string | null
}
export type PermissionPayload = { name: string }

export const PermissionService = {
  getPermissions(): Promise<PermissionRow[]> {
    return httpService.get<PermissionRow[]>('/auth/permissions/all')
  },
  getPermission(id: number): Promise<PermissionRow> { return httpService.get<PermissionRow>(`/auth/permissions/${id}`) },
  createPermission(payload: PermissionPayload): Promise<PermissionRow> { return httpService.post<PermissionRow, PermissionPayload>('/auth/permissions', payload) },
  updatePermission(id: number, payload: PermissionPayload): Promise<PermissionRow> { return httpService.put<PermissionRow, PermissionPayload>(`/auth/permissions/${id}`, payload) },
  deletePermission(id: number): Promise<void> { return httpService.delete<void>(`/auth/permissions/${id}`) },
}
