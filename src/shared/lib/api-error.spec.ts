import { AxiosError, type AxiosResponse } from 'axios'
import { describe, expect, it } from 'vitest'
import { toApiError } from './api-error'

describe('toApiError', () => {
  it('giữ lại thông báo tiếng Việt có dấu', () => {
    expect(toApiError(new Error('Không thể lưu chứng từ.')).message).toBe('Không thể lưu chứng từ.')
  })

  it('thay thông báo API tiếng Anh và lỗi trường bằng tiếng Việt', () => {
    const response = {
      data: {
        message: 'Validation failed.',
        errors: { customer_id: ['The customer field is required.'] },
      },
      status: 422,
    } as AxiosResponse
    const error = new AxiosError('Request failed', undefined, undefined, undefined, response)
    const apiError = toApiError(error)

    expect(apiError.message).toBe('Đã xảy ra lỗi. Vui lòng thử lại.')
    expect(apiError.fieldErrors.customer_id).toEqual(['Giá trị không hợp lệ.'])
  })
})
