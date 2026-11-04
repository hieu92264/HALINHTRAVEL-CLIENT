import type { Payroll } from './finance.types'

type PayrollPeriod = Pick<Payroll, 'month' | 'year' | 'from_date' | 'to_date'>

export function payrollPeriodIssues(period: PayrollPeriod, now = new Date()): string[] {
  const issues: string[] = []
  const prefix = `${period.year}-${String(period.month).padStart(2, '0')}`
  const end = new Date(Date.UTC(period.year, period.month, 0)).getUTCDate()
  if (period.from_date !== `${prefix}-01` || period.to_date !== `${prefix}-${String(end).padStart(2, '0')}`) {
    issues.push('Khoảng ngày không khớp tháng lương; hãy sửa kỳ nháp hoặc liên hệ quản trị viên.')
  }
  return issues
}
