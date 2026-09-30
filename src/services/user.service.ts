import { httpService } from './http.service'

export type UserRow = {
  id: number | string
  user_name?: string | null
  name?: string | null
  email?: string | null
  roles?: string[] | { name?: string }[] | null
  is_active?: boolean | null
  created_at?: string | null
}

export type UserListResponse = {
  data: UserRow[]
  current_page?: number
  last_page?: number
  per_page?: number
  total?: number
}

export const UserService = {
  async getUsers(): Promise<UserListResponse> {
    const metadata = await httpService.get<UserListResponse | UserRow[]>('/auth/users')

    if (Array.isArray(metadata)) {
      return { data: metadata, total: metadata.length, current_page: 1, last_page: 1 }
    }

    return metadata
  },
}
