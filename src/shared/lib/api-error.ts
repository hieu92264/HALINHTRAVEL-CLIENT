import { AxiosError } from 'axios'

const fallbackMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.'
const fallbackFieldMessage = 'Giá trị không hợp lệ.'
const vietnameseCharacterPattern = /[À-ỹĐđ]/u

function toVietnameseMessage(message: unknown, fallback = fallbackMessage): string {
  if (typeof message !== 'string') return fallback
  const normalized = message.trim()
  return vietnameseCharacterPattern.test(normalized) ? normalized : fallback
}

function normalizeFieldErrors(errors: Record<string, string[]> | undefined): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(errors ?? {}).map(([field, messages]) => [
      field,
      messages.map((message) => toVietnameseMessage(message, fallbackFieldMessage)),
    ]),
  )
}

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
      toVietnameseMessage(response?.message || error.message),
      error.response?.status,
      normalizeFieldErrors(response?.errors),
    )
  }

  if (error instanceof Error) return new ApiError(toVietnameseMessage(error.message))
  return new ApiError(fallbackMessage)
}

export function applyApiFieldErrors(
  setFieldError: (field: string, message: string) => void,
  error: unknown,
): boolean {
  if (!(error instanceof ApiError) || !Object.keys(error.fieldErrors).length) return false
  Object.entries(error.fieldErrors).forEach(([field, messages]) =>
    setFieldError(field, messages[0] || fallbackFieldMessage),
  )
  return true
}
