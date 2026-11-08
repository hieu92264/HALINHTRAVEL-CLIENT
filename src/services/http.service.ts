import type { AxiosRequestConfig } from 'axios'

import { apiClient } from '@/configs/axios.config'
import { ApiError, toApiError, toApiErrorResponse } from '@/shared/lib/api-error'

type RequestBody = unknown
export type DownloadedFile = { blob: Blob; filename: string; contentType: string }

function filenameFromDisposition(disposition: string): string {
  return /filename\*?=(?:UTF-8''|\")?([^\";]+)/i.exec(disposition)?.[1]?.trim() || 'report.pdf'
}

async function readBlobApiError(blob: Blob, statusCode?: number): Promise<ApiError> {
  try {
    return toApiErrorResponse(JSON.parse(await blob.text()), statusCode)
  } catch {
    return new ApiError('Không thể tạo tệp PDF. Vui lòng thử lại.', statusCode)
  }
}

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
  async downloadPdf(url: string, config?: AxiosRequestConfig): Promise<DownloadedFile> {
    try {
      const response = await apiClient.get<Blob>(url, { ...config, responseType: 'blob' })
      const disposition = String(response.headers['content-disposition'] ?? '')
      const contentType = String(response.headers['content-type'] ?? response.data.type).toLowerCase()

      if (!contentType.includes('application/pdf')) {
        throw await readBlobApiError(response.data)
      }
      if (response.data.size === 0) {
        throw new ApiError('Tệp PDF không có dữ liệu. Vui lòng thử lại.')
      }

      return { blob: response.data, filename: filenameFromDisposition(disposition), contentType }
    } catch (error) {
      if (error instanceof ApiError) throw error
      if (error instanceof Error && 'response' in error) {
        const response = (error as { response?: { data?: unknown; status?: number } }).response
        if (response?.data instanceof Blob) {
          throw await readBlobApiError(response.data, response.status)
        }
      }
      throw toApiError(error)
    }
  },
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
