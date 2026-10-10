import type { DispatchOrderStatus, TripScheduleStatus } from './dispatch.types'

export const scheduleStatusLabels: Record<TripScheduleStatus, string> = { PLANNED: 'Chờ phân công', ASSIGNED: 'Đã phân công', IN_PROGRESS: 'Đang chạy', COMPLETED: 'Hoàn tất', CANCELLED: 'Đã hủy' }
export const orderStatusLabels: Record<DispatchOrderStatus, string> = { ISSUED: 'Đã phát hành', ASSIGNED: 'Đã phân công', IN_PROGRESS: 'Đang chạy', PENDING_CONFIRMATION: 'Chờ điều hành xác nhận', COMPLETED: 'Hoàn tất', CANCELLED: 'Đã hủy' }
export const canIssueOrder = (status: TripScheduleStatus) => status === 'ASSIGNED'
export const canDriverStart = (status: DispatchOrderStatus) => status === 'ASSIGNED'
export const canDriverReport = (status: DispatchOrderStatus) => status === 'IN_PROGRESS'
export const canConfirmCompletion = (status: DispatchOrderStatus) => status === 'PENDING_CONFIRMATION'
