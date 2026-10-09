import type {
  DriverAdvance,
  DriverAdvancePayload,
  DriverAttendance,
  Payroll,
  PayrollItem,
  PayrollPayload,
} from '@/modules/finance/finance.types'
import { httpService } from '@/services/http.service'

const payrollUrl = '/driver-payroll'

export class DriverPayrollService {
  static getAdvances() {
    return httpService.get<DriverAdvance[]>(`${payrollUrl}/advances`)
  }
  static createAdvance(payload: DriverAdvancePayload) {
    return httpService.post<DriverAdvance, DriverAdvancePayload>(`${payrollUrl}/advances`, payload)
  }
  static updateAdvance(id: number, payload: Partial<DriverAdvancePayload>) {
    return httpService.patch<DriverAdvance, Partial<DriverAdvancePayload>>(
      `${payrollUrl}/advances/${id}`,
      payload,
    )
  }
  static deleteAdvance(id: number) {
    return httpService.delete<void>(`${payrollUrl}/advances/${id}`)
  }
  static confirmAdvance(id: number) {
    return httpService.post<DriverAdvance>(`${payrollUrl}/advances/${id}/confirm`)
  }

  static getAttendances() {
    return httpService.get<DriverAttendance[]>(`${payrollUrl}/attendances`)
  }
  static getAttendance(id: number) {
    return httpService.get<DriverAttendance>(`${payrollUrl}/attendances/${id}`)
  }
  static updateAttendance(
    id: number,
    payload: Partial<Pick<DriverAttendance, 'work_units' | 'rate'>>,
  ) {
    return httpService.patch<
      DriverAttendance,
      Partial<Pick<DriverAttendance, 'work_units' | 'rate'>>
    >(`${payrollUrl}/attendances/${id}`, payload)
  }
  static confirmAttendance(id: number) {
    return httpService.post<DriverAttendance>(`${payrollUrl}/attendances/${id}/confirm`)
  }

  static getPayrolls() {
    return httpService.get<Payroll[]>(`${payrollUrl}/payrolls`)
  }
  static getPayroll(id: number) {
    return httpService.get<Payroll>(`${payrollUrl}/payrolls/${id}`)
  }
  static createPayroll(payload: PayrollPayload) {
    return httpService.post<Payroll, PayrollPayload>(`${payrollUrl}/payrolls`, payload)
  }
  static updatePayroll(id: number, payload: Partial<PayrollPayload>) {
    return httpService.patch<Payroll, Partial<PayrollPayload>>(
      `${payrollUrl}/payrolls/${id}`,
      payload,
    )
  }
  static calculatePayroll(id: number) {
    return httpService.post<Payroll>(`${payrollUrl}/payrolls/${id}/calculate`)
  }
  static updatePayrollItem(
    id: number,
    itemId: number,
    payload: Pick<PayrollItem, 'meal_allowance' | 'other_allowance' | 'deduction_amount' | 'note'>,
  ) {
    return httpService.patch<Payroll, typeof payload>(
      `${payrollUrl}/payrolls/${id}/items/${itemId}`,
      payload,
    )
  }
  static approvePayroll(id: number) {
    return httpService.post<Payroll>(`${payrollUrl}/payrolls/${id}/approve`)
  }
  static markPayrollPaid(id: number) {
    return httpService.post<Payroll>(`${payrollUrl}/payrolls/${id}/mark-paid`)
  }
  static lockPayroll(id: number) {
    return httpService.post<Payroll>(`${payrollUrl}/payrolls/${id}/lock`)
  }
}
