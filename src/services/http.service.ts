import type { AxiosRequestConfig } from 'axios'

import { apiClient } from '@/configs/axios.config'

type RequestBody = unknown

async function unwrapMetadata<TMetadata>(request: Promise<{ data: ResponseBody<TMetadata> }>) {
  const response = await request
  return response.data.metadata
}

export const httpService = {
  async get<TMetadata>(url: string, config?: AxiosRequestConfig) {
    return unwrapMetadata<TMetadata>(apiClient.get<ResponseBody<TMetadata>>(url, config))
  },

  async post<TMetadata, TBody = RequestBody>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ) {
    return unwrapMetadata<TMetadata>(apiClient.post<ResponseBody<TMetadata>>(url, body, config))
  },

  async put<TMetadata, TBody = RequestBody>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ) {
    return unwrapMetadata<TMetadata>(apiClient.put<ResponseBody<TMetadata>>(url, body, config))
  },

  async patch<TMetadata, TBody = RequestBody>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ) {
    return unwrapMetadata<TMetadata>(apiClient.patch<ResponseBody<TMetadata>>(url, body, config))
  },

  async delete<TMetadata>(url: string, config?: AxiosRequestConfig) {
    return unwrapMetadata<TMetadata>(apiClient.delete<ResponseBody<TMetadata>>(url, config))
  },

  async getResponseBody<TMetadata>(url: string, config?: AxiosRequestConfig) {
    const response = await apiClient.get<ResponseBody<TMetadata>>(url, config)
    return response.data
  },

  async postResponseBody<TMetadata, TBody = RequestBody>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ) {
    const response = await apiClient.post<ResponseBody<TMetadata>>(url, body, config)
    return response.data
  },

  async putResponseBody<TMetadata, TBody = RequestBody>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ) {
    const response = await apiClient.put<ResponseBody<TMetadata>>(url, body, config)
    return response.data
  },

  async patchResponseBody<TMetadata, TBody = RequestBody>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ) {
    const response = await apiClient.patch<ResponseBody<TMetadata>>(url, body, config)
    return response.data
  },

  async deleteResponseBody<TMetadata>(url: string, config?: AxiosRequestConfig) {
    const response = await apiClient.delete<ResponseBody<TMetadata>>(url, config)
    return response.data
  },
}
