export type AuthPayload = {
  access_token: string
  token_type: string
  expires_in: number
}

export type AuthUser = {
  id: number
  user_name: string
  email: string
  roles: string[]
  permissions: string[]
}
