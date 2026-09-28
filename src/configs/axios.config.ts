import { useAuthStore } from '@/modules/auth/auth.store'
import type { AuthPayload } from '@/modules/auth/auth.type'
import { AuthService } from '@/services/auth.service'
import { useLocaleStore } from '@/stores/locale.store'
import { apiBaseUrl } from '@/configs/env.config'
import { emitSessionExpired } from '@/shared/lib/auth-events'
import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import type { Pinia } from 'pinia'
import qs from 'qs'

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
  },
  paramsSerializer: (params) => {
    return qs.stringify(params, {
      skipNulls: true,
      format: 'RFC1738',
    })
  },
})

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

let installed = false
let refreshTokenPromise: Promise<AuthPayload | undefined> | null = null

function matchesEndpoint(url: string | undefined, endpoint: string): boolean {
  const pathname = url?.split('?')[0]
  return pathname === endpoint || pathname?.endsWith(endpoint) === true
}

function isLoginRequest(url: string | undefined): boolean {
  return matchesEndpoint(url, '/auth/login')
}

function isRefreshRequest(url: string | undefined): boolean {
  return matchesEndpoint(url, '/auth/refresh')
}

export function setupAxiosInterceptors(pinia: Pinia): void {
  if (installed) return
  installed = true

  apiClient.interceptors.request.use((config) => {
    const authStore = useAuthStore(pinia)
    const localeStore = useLocaleStore(pinia)
    const headers = AxiosHeaders.from(config.headers)

    headers.set('Accept', 'application/json')
    headers.set('X-Locale', localeStore.locale)

    if (isLoginRequest(config.url) || !authStore.accessToken) {
      headers.delete('Authorization')
    } else {
      headers.set('Authorization', `Bearer ${authStore.accessToken}`)
    }

    config.headers = headers
    return config
  })

  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ResponseBody<unknown>>) => {
      const authStore = useAuthStore(pinia)
      const originalRequest = error.config as RetryableRequestConfig | undefined

      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest._retry ||
        !authStore.accessToken ||
        isLoginRequest(originalRequest.url) ||
        isRefreshRequest(originalRequest.url)
      ) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      refreshTokenPromise ??= AuthService.refreshToken()
        .then((payload) => {
          if (!payload.access_token) return undefined

          authStore.setSession(payload)
          return payload
        })
        .catch(() => undefined)
        .finally(() => {
          refreshTokenPromise = null
        })

      const payload = await refreshTokenPromise

      if (!payload?.access_token) {
        authStore.clearSession()
        emitSessionExpired()
        return Promise.reject(error)
      }

      const headers = AxiosHeaders.from(originalRequest.headers)
      headers.set('Authorization', `Bearer ${payload.access_token}`)
      originalRequest.headers = headers

      return apiClient(originalRequest)
    },
  )
}
