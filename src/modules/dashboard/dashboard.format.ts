import type { DashboardAlertSeverity, DashboardTripStatus } from './dashboard.types'

export const dashboardStatusLabel: Record<DashboardTripStatus, string> = {
  PLANNED: 'Chờ phân công', ASSIGNED: 'Đã phân công', IN_PROGRESS: 'Đang chạy', COMPLETED: 'Hoàn tất', CANCELLED: 'Đã hủy',
}

export const dashboardStatusClass: Record<DashboardTripStatus, string> = {
  PLANNED: 'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-400/15 dark:text-amber-300',
  ASSIGNED: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/15 dark:text-blue-300',
  IN_PROGRESS: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300',
  COMPLETED: 'bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-500/15 dark:text-slate-300',
  CANCELLED: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300',
}

export const dashboardAlertClass: Record<DashboardAlertSeverity, string> = {
  critical: 'border-rose-200 bg-rose-50/60 dark:border-rose-500/20 dark:bg-rose-400/5',
  warning: 'border-amber-200 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-400/5',
  info: 'border-blue-200 bg-blue-50/60 dark:border-blue-500/20 dark:bg-blue-400/5',
}

export function formatDashboardMoney(value: string | null): string {
  return value === null ? '—' : `${new Intl.NumberFormat('vi-VN').format(Number(value))} đ`
}

export function formatDashboardDateTime(value: string | null): string {
  return value ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '—'
}
