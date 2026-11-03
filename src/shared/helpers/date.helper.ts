const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh'

const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/

/** Chuẩn hóa dữ liệu API cho input[type="date"] mà không đổi múi giờ. */
export function toDateInputValue(value: string | null | undefined): string {
  if (!value) return ''

  const dateOnly = value.match(dateOnlyPattern)
  if (dateOnly) return dateOnly[0]

  const matched = value.match(/^(\d{4}-\d{2}-\d{2})/)
  return matched?.[1] ?? ''
}

/** Chuẩn hóa TIME từ database/API (HH:mm:ss) cho input[type="time"]. */
export function toTimeInputValue(value: string | null | undefined): string {
  return value?.slice(0, 5) ?? ''
}

/** Hiển thị ngày theo định dạng quen thuộc tại Việt Nam, không làm lệch ngày thuần. */
export function formatVietnameseDate(value: string | null | undefined): string {
  if (!value) return '—'

  const dateOnly = value.match(dateOnlyPattern)
  if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: VIETNAM_TIME_ZONE,
      }).format(date)
}

/** Hiển thị mốc thời gian theo múi giờ Việt Nam. */
export function formatVietnameseDateTime(value: string | null | undefined): string {
  if (!value) return 'Chưa cập nhật'

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone: VIETNAM_TIME_ZONE,
      }).format(date)
}
