import type { ContractStatus, ScheduleDay } from './contract.types'

export const isContractDraft = (status: ContractStatus) => status === 'draft'
export const canCancelContract = (status: ContractStatus) =>
  status === 'draft' || status === 'active'
export const canCompleteContract = (status: ContractStatus) => status === 'active'
export const isValidDeposit = (deposit: string | number, total: string | number) =>
  Number(deposit || 0) >= 0 && Number(deposit || 0) <= Number(total || 0)

export function validateScheduleDays(days: ScheduleDay[]): string | null {
  if (!days.length || days.some((day) => !day.pickup_time))
    return 'Cần có ít nhất một ngày chạy với giờ đón.'

  const seen = new Set<string>()
  for (const day of days) {
    const key = `${day.weekday}|${day.pickup_time}`
    if (seen.has(key)) return 'Không được trùng thứ và giờ đón.'
    seen.add(key)
    if (day.return_time && day.return_time <= day.pickup_time)
      return 'Giờ về phải sau giờ đón trong cùng ngày.'
  }

  return null
}
