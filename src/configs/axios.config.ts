import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import qs from 'qs'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
