import { AxiosError } from 'axios'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (error instanceof AxiosError) {
    const response = error.response?.data as Partial<ResponseBody<unknown>> | undefined
    return new ApiError(response?.message || error.message || 'Không thể kết nối đến máy chủ.', error.response?.status)
  }

  if (error instanceof Error) return new ApiError(error.message)
  return new ApiError('Đã xảy ra lỗi không xác định.')
}
