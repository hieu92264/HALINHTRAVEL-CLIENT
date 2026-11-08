import type { AxiosRequestConfig } from 'axios'

import { apiClient } from '@/configs/axios.config'
import { ApiError, toApiError, toApiErrorResponse } from '@/shared/lib/api-error'

type RequestBody = unknown
export type DownloadedFile = { blob: Blob; filename: string; contentType: string }
type DownloadOptions = {
  expectedContentType: string
  fallbackFilename: string
  fileLabel: string
}

function filenameFromDisposition(disposition: string, fallbackFilename: string): string {
  return /filename\*?=(?:UTF-8''|\")?([^\";]+)/i.exec(disposition)?.[1]?.trim() || fallbackFilename
}

async function readBlobApiError(blob: Blob, statusCode?: number, fallback = 'Không thể tạo tệp. Vui lòng thử lại.'): Promise<ApiError> {
  try {
    return toApiErrorResponse(JSON.parse(await blob.text()), statusCode)
  } catch {
    return new ApiError(fallback, statusCode)
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
  async downloadFile(
    url: string,
    options: DownloadOptions,
    config?: AxiosRequestConfig,
  ): Promise<DownloadedFile> {
    try {
      const response = await apiClient.get<Blob>(url, { ...config, responseType: 'blob' })
      const disposition = String(response.headers['content-disposition'] ?? '')
      const contentType = String(response.headers['content-type'] ?? response.data.type).toLowerCase()

      if (!contentType.includes(options.expectedContentType)) {
        throw await readBlobApiError(response.data, undefined, `Không thể tạo tệp ${options.fileLabel}. Vui lòng thử lại.`)
      }
      if (response.data.size === 0) {
        throw new ApiError(`Tệp ${options.fileLabel} không có dữ liệu. Vui lòng thử lại.`)
      }

      return {
        blob: response.data,
        filename: filenameFromDisposition(disposition, options.fallbackFilename),
        contentType,
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      if (error instanceof Error && 'response' in error) {
        const response = (error as { response?: { data?: unknown; status?: number } }).response
        if (response?.data instanceof Blob) {
          throw await readBlobApiError(response.data, response.status, `Không thể tạo tệp ${options.fileLabel}. Vui lòng thử lại.`)
        }
      }
      throw toApiError(error)
    }
  },
  downloadPdf(url: string, config?: AxiosRequestConfig): Promise<DownloadedFile> {
    return this.downloadFile(url, {
      expectedContentType: 'application/pdf',
      fallbackFilename: 'report.pdf',
      fileLabel: 'PDF',
    }, config)
  },
  downloadExcel(url: string, config?: AxiosRequestConfig): Promise<DownloadedFile> {
    return this.downloadFile(url, {
      expectedContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fallbackFilename: 'report.xlsx',
      fileLabel: 'Excel',
    }, config)
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
