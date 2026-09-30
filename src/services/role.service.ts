import { httpService } from './http.service'

export type RoleRow = {
  id: number
  name: string
  guard_name: string
  is_active: boolean
  is_system: boolean
  permissions: string[]
  created_at: string | null
  updated_at: string | null
}
export type RolePayload = { name: string }

export const RoleService = {
  getRoles(): Promise<RoleRow[]> {
    return httpService.get<RoleRow[]>('/auth/roles/all')
  },
  getRole(id: number): Promise<RoleRow> { return httpService.get<RoleRow>(`/auth/roles/${id}`) },
  createRole(payload: RolePayload): Promise<RoleRow> { return httpService.post<RoleRow, RolePayload>('/auth/roles', payload) },
  updateRole(id: number, payload: RolePayload): Promise<RoleRow> { return httpService.put<RoleRow, RolePayload>(`/auth/roles/${id}`, payload) },
  deleteRole(id: number): Promise<void> { return httpService.delete<void>(`/auth/roles/${id}`) },
  syncPermissions(id: number, permission_ids: number[]): Promise<RoleRow> { return httpService.put<RoleRow, { permission_ids: number[] }>(`/auth/roles/${id}/permissions`, { permission_ids }) },
}
