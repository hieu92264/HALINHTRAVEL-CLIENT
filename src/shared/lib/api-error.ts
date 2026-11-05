import { AxiosError } from 'axios'

const fallbackMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.'
const fallbackFieldMessage = 'Giá trị không hợp lệ.'
const vietnameseCharacterPattern = /[À-ỹĐđ]/u
const genericApiMessages = new Set([
  'Dữ liệu gửi lên không hợp lệ.',
  'Đã xảy ra lỗi. Vui lòng thử lại.',
  'Validation failed.',
])

function toVietnameseMessage(message: unknown, fallback = fallbackMessage): string {
  if (typeof message !== 'string') return fallback
  const normalized = message.trim()
  return vietnameseCharacterPattern.test(normalized) ? normalized : fallback
}

function normalizeFieldErrors(
  errors: unknown,
): Record<string, string[]> {
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return {}

  return Object.fromEntries(
    Object.entries(errors).flatMap(([field, messages]) => {
      const values = Array.isArray(messages) ? messages : typeof messages === 'string' ? [messages] : []
      if (!values.length) return []

      return [[field, values.map((message) => toVietnameseMessage(message, fallbackFieldMessage))]]
    }),
  )
}

function firstFieldMessage(fieldErrors: Record<string, string[]>): string | undefined {
  return Object.values(fieldErrors).flat().find((message) => message !== fallbackFieldMessage)
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
      | (Partial<ResponseBody<unknown>> & {
          errors?: unknown
          metadata?: unknown
        })
      | undefined
    const fieldErrors = normalizeFieldErrors(response?.errors ?? response?.metadata)
    const responseMessage = typeof response?.message === 'string' ? response.message.trim() : ''
    const message = toVietnameseMessage(responseMessage || error.message)

    return new ApiError(
      genericApiMessages.has(responseMessage) ? (firstFieldMessage(fieldErrors) ?? message) : message,
      error.response?.status,
      fieldErrors,
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
