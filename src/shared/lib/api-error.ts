import { AxiosError } from 'axios'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (error instanceof AxiosError) {
    const response = error.response?.data as
      (Partial<ResponseBody<unknown>> & { errors?: Record<string, string[]> }) | undefined
    return new ApiError(
      response?.message || error.message || 'Không thể kết nối đến máy chủ.',
      error.response?.status,
      response?.errors ?? {},
    )
  }

  if (error instanceof Error) return new ApiError(error.message)
  return new ApiError('Đã xảy ra lỗi không xác định.')
}

export function applyApiFieldErrors(
  setFieldError: (field: string, message: string) => void,
  error: unknown,
): boolean {
  if (!(error instanceof ApiError) || !Object.keys(error.fieldErrors).length) return false
  Object.entries(error.fieldErrors).forEach(([field, messages]) =>
    setFieldError(field, messages[0] || 'Giá trị không hợp lệ'),
  )
  return true
}
