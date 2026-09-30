import { httpService } from './http.service'

export type UserRow = {
  id: number | string
  user_name?: string | null
  name?: string | null
  email?: string | null
  roles?: string[] | { name?: string }[] | null
  direct_permissions?: string[] | null
  permissions?: string[] | null
  is_active?: boolean | null
  last_login_at?: string | null
  email_verified_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}
export type UserPayload = { user_name?: string; email?: string; password?: string; is_active?: boolean; role_ids?: number[] }

export const UserService = {
  getUsers(): Promise<UserRow[]> {
    return httpService.get<UserRow[]>('/auth/users/all')
  },
  getUser(id: number | string): Promise<UserRow> { return httpService.get<UserRow>(`/auth/users/${id}`) },
  createUser(payload: Required<Pick<UserPayload, 'user_name' | 'email' | 'password'>> & UserPayload): Promise<UserRow> { return httpService.post<UserRow, UserPayload>('/auth/users', payload) },
  updateUser(id: number | string, payload: Omit<UserPayload, 'user_name' | 'role_ids'>): Promise<UserRow> { return httpService.put<UserRow, Omit<UserPayload, 'user_name' | 'role_ids'>>(`/auth/users/${id}`, payload) },
  deactivateUser(id: number | string): Promise<void> { return httpService.delete<void>(`/auth/users/${id}`) },
  syncRoles(id: number | string, role_ids: number[]): Promise<UserRow> { return httpService.put<UserRow, { role_ids: number[] }>(`/auth/users/${id}/roles`, { role_ids }) },
  syncPermissions(id: number | string, permission_ids: number[]): Promise<UserRow> { return httpService.put<UserRow, { permission_ids: number[] }>(`/auth/users/${id}/permissions`, { permission_ids }) },
}
