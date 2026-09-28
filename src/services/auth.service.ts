import type { AuthPayload, AuthUser } from '@/modules/auth/auth.type'

import { httpService } from './http.service'

export const AuthService = {
  login<TCredentials>(credentials: TCredentials): Promise<AuthPayload> {
    return httpService.post<AuthPayload, TCredentials>('/auth/login', credentials)
  },

  refreshToken(): Promise<AuthPayload> {
    return httpService.post<AuthPayload>('/auth/refresh')
  },

  getMe(): Promise<AuthUser> {
    return httpService.get<AuthUser>('/auth/me')
  },

  logout(): Promise<void> {
    return httpService.post<void>('/auth/logout')
  },
}
