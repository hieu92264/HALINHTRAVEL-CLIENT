import type { AxiosRequestConfig } from 'axios'

import { apiClient } from '@/configs/axios.config'
import { toApiError } from '@/shared/lib/api-error'

type RequestBody = unknown

async function unwrapMetadata<TMetadata>(
  request: Promise<{ data: ResponseBody<TMetadata> }>,
): Promise<TMetadata> {
  try {
    const response = await request
    return response.data.metadata
  } catch (error) {
    throw toApiError(error)
  }
}

async function unwrapResponseBody<TMetadata>(
  request: Promise<{ data: ResponseBody<TMetadata> }>,
): Promise<ResponseBody<TMetadata>> {
  try {
    const response = await request
    return response.data
  } catch (error) {
    throw toApiError(error)
  }
}

export const httpService = {
  async get<TMetadata>(url: string, config?: AxiosRequestConfig): Promise<TMetadata> {
    return unwrapMetadata<TMetadata>(apiClient.get<ResponseBody<TMetadata>>(url, config))
  },

  async post<TMetadata, TBody = RequestBody>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<TMetadata> {
    return unwrapMetadata<TMetadata>(apiClient.post<ResponseBody<TMetadata>>(url, body, config))
  },

  async put<TMetadata, TBody = RequestBody>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<TMetadata> {
    return unwrapMetadata<TMetadata>(apiClient.put<ResponseBody<TMetadata>>(url, body, config))
  },

  async patch<TMetadata, TBody = RequestBody>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<TMetadata> {
    return unwrapMetadata<TMetadata>(apiClient.patch<ResponseBody<TMetadata>>(url, body, config))
  },

  async delete<TMetadata>(url: string, config?: AxiosRequestConfig): Promise<TMetadata> {
    return unwrapMetadata<TMetadata>(apiClient.delete<ResponseBody<TMetadata>>(url, config))
  },

  async getResponseBody<TMetadata>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ResponseBody<TMetadata>> {
    return unwrapResponseBody(apiClient.get<ResponseBody<TMetadata>>(url, config))
  },

  async postResponseBody<TMetadata, TBody = RequestBody>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<ResponseBody<TMetadata>> {
    return unwrapResponseBody(apiClient.post<ResponseBody<TMetadata>>(url, body, config))
  },

  async putResponseBody<TMetadata, TBody = RequestBody>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<ResponseBody<TMetadata>> {
    return unwrapResponseBody(apiClient.put<ResponseBody<TMetadata>>(url, body, config))
  },

  async patchResponseBody<TMetadata, TBody = RequestBody>(
    url: string,
    body?: TBody,
    config?: AxiosRequestConfig,
  ): Promise<ResponseBody<TMetadata>> {
    return unwrapResponseBody(apiClient.patch<ResponseBody<TMetadata>>(url, body, config))
  },

  async deleteResponseBody<TMetadata>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ResponseBody<TMetadata>> {
    return unwrapResponseBody(apiClient.delete<ResponseBody<TMetadata>>(url, config))
  },
}
