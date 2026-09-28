export interface User {
  id: number
  is_active: boolean
  user_name: string
  email: string
  last_login_at: string | null
  email_verified_at: string | null
  roles: string[]
  direct_permissions: string[]
  permissions: string[]
}
