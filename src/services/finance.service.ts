import type {
  DebtRow,
  Expense,
  ExpensePayload,
  PartnerPayment,
  PartnerPaymentPayload,
  Receipt,
  ReceiptPayload,
} from '@/modules/finance/finance.types'
import { httpService } from '@/services/http.service'

const financeUrl = '/finance'

export class FinanceService {
  static getReceipts() {
    return httpService.get<Receipt[]>(`${financeUrl}/receipts`)
  }
  static getReceipt(id: number) {
    return httpService.get<Receipt>(`${financeUrl}/receipts/${id}`)
  }
  static createReceipt(payload: ReceiptPayload) {
    return httpService.post<Receipt, ReceiptPayload>(`${financeUrl}/receipts`, payload)
  }
  static updateReceipt(id: number, payload: Partial<ReceiptPayload>) {
    return httpService.patch<Receipt, Partial<ReceiptPayload>>(
      `${financeUrl}/receipts/${id}`,
      payload,
    )
  }
  static deleteReceipt(id: number) {
    return httpService.delete<void>(`${financeUrl}/receipts/${id}`)
  }
  static lockReceipt(id: number) {
    return httpService.post<Receipt>(`${financeUrl}/receipts/${id}/lock`)
  }

  static getExpenses() {
    return httpService.get<Expense[]>(`${financeUrl}/expenses`)
  }
  static createExpense(payload: ExpensePayload) {
    return httpService.post<Expense, ExpensePayload>(`${financeUrl}/expenses`, payload)
  }
  static updateExpense(id: number, payload: Partial<ExpensePayload>) {
    return httpService.patch<Expense, Partial<ExpensePayload>>(
      `${financeUrl}/expenses/${id}`,
      payload,
    )
  }
  static deleteExpense(id: number) {
    return httpService.delete<void>(`${financeUrl}/expenses/${id}`)
  }
  static lockExpense(id: number) {
    return httpService.post<Expense>(`${financeUrl}/expenses/${id}/lock`)
  }

  static getPartnerPayments() {
    return httpService.get<PartnerPayment[]>(`${financeUrl}/partner-payments`)
  }
  static createPartnerPayment(payload: PartnerPaymentPayload) {
    return httpService.post<PartnerPayment, PartnerPaymentPayload>(
      `${financeUrl}/partner-payments`,
      payload,
    )
  }
  static updatePartnerPayment(id: number, payload: Partial<PartnerPaymentPayload>) {
    return httpService.patch<PartnerPayment, Partial<PartnerPaymentPayload>>(
      `${financeUrl}/partner-payments/${id}`,
      payload,
    )
  }
  static deletePartnerPayment(id: number) {
    return httpService.delete<void>(`${financeUrl}/partner-payments/${id}`)
  }
  static lockPartnerPayment(id: number) {
    return httpService.post<PartnerPayment>(`${financeUrl}/partner-payments/${id}/lock`)
  }

  static getCustomerDebts(params?: Record<string, string>) {
    return httpService.get<DebtRow[]>('/other/reports/customer-debts', { params })
  }
  static getPartnerDebts(params?: Record<string, string>) {
    return httpService.get<DebtRow[]>('/other/reports/partner-debts', { params })
  }
}
