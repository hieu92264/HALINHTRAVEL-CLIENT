import { DriverPayrollService } from '@/services/driver-payroll.service'
import { FinanceService } from '@/services/finance.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'

export const financeKeys = {
  receipts: ['finance', 'receipts'] as const,
  expenses: ['finance', 'expenses'] as const,
  partnerPayments: ['finance', 'partner-payments'] as const,
  customerDebts: (params: Record<string, string>) => ['finance', 'customer-debts', params] as const,
  partnerDebts: (params: Record<string, string>) => ['finance', 'partner-debts', params] as const,
  advances: ['driver-payroll', 'advances'] as const,
  attendances: ['driver-payroll', 'attendances'] as const,
  payrolls: ['driver-payroll', 'payrolls'] as const,
  payroll: (id: number) => ['driver-payroll', 'payrolls', id] as const,
}

export const useReceiptsQuery = () =>
  useQuery({ queryKey: financeKeys.receipts, queryFn: FinanceService.getReceipts })
export const useExpensesQuery = () =>
  useQuery({ queryKey: financeKeys.expenses, queryFn: FinanceService.getExpenses })
export const usePartnerPaymentsQuery = () =>
  useQuery({ queryKey: financeKeys.partnerPayments, queryFn: FinanceService.getPartnerPayments })
export const useCustomerDebtsQuery = (params: () => Record<string, string>) =>
  useQuery({
    queryKey: computed(() => financeKeys.customerDebts(params())),
    queryFn: () => FinanceService.getCustomerDebts(params()),
  })
export const usePartnerDebtsQuery = (params: () => Record<string, string>) =>
  useQuery({
    queryKey: computed(() => financeKeys.partnerDebts(params())),
    queryFn: () => FinanceService.getPartnerDebts(params()),
  })
export const useAdvancesQuery = () =>
  useQuery({ queryKey: financeKeys.advances, queryFn: DriverPayrollService.getAdvances })
export const useAttendancesQuery = () =>
  useQuery({ queryKey: financeKeys.attendances, queryFn: DriverPayrollService.getAttendances })
export const usePayrollsQuery = () =>
  useQuery({ queryKey: financeKeys.payrolls, queryFn: DriverPayrollService.getPayrolls })
export const usePayrollQuery = (id: () => number) =>
  useQuery({
    queryKey: computed(() => financeKeys.payroll(id())),
    queryFn: () => DriverPayrollService.getPayroll(id()),
    enabled: () => Number.isInteger(id()) && id() > 0,
  })

export function useFinanceMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['finance'] })
  return {
    createReceipt: useMutation({ mutationFn: FinanceService.createReceipt, onSuccess: invalidate }),
    updateReceipt: useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number
        data: Parameters<typeof FinanceService.updateReceipt>[1]
      }) => FinanceService.updateReceipt(id, data),
      onSuccess: invalidate,
    }),
    deleteReceipt: useMutation({ mutationFn: FinanceService.deleteReceipt, onSuccess: invalidate }),
    lockReceipt: useMutation({ mutationFn: FinanceService.lockReceipt, onSuccess: invalidate }),
    createExpense: useMutation({ mutationFn: FinanceService.createExpense, onSuccess: invalidate }),
    updateExpense: useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number
        data: Parameters<typeof FinanceService.updateExpense>[1]
      }) => FinanceService.updateExpense(id, data),
      onSuccess: invalidate,
    }),
    deleteExpense: useMutation({ mutationFn: FinanceService.deleteExpense, onSuccess: invalidate }),
    lockExpense: useMutation({ mutationFn: FinanceService.lockExpense, onSuccess: invalidate }),
    createPartnerPayment: useMutation({
      mutationFn: FinanceService.createPartnerPayment,
      onSuccess: invalidate,
    }),
    updatePartnerPayment: useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number
        data: Parameters<typeof FinanceService.updatePartnerPayment>[1]
      }) => FinanceService.updatePartnerPayment(id, data),
      onSuccess: invalidate,
    }),
    deletePartnerPayment: useMutation({
      mutationFn: FinanceService.deletePartnerPayment,
      onSuccess: invalidate,
    }),
    lockPartnerPayment: useMutation({
      mutationFn: FinanceService.lockPartnerPayment,
      onSuccess: invalidate,
    }),
  }
}

export function useDriverPayrollMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['driver-payroll'] })
  return {
    createAdvance: useMutation({
      mutationFn: DriverPayrollService.createAdvance,
      onSuccess: invalidate,
    }),
    updateAdvance: useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number
        data: Parameters<typeof DriverPayrollService.updateAdvance>[1]
      }) => DriverPayrollService.updateAdvance(id, data),
      onSuccess: invalidate,
    }),
    deleteAdvance: useMutation({
      mutationFn: DriverPayrollService.deleteAdvance,
      onSuccess: invalidate,
    }),
    confirmAdvance: useMutation({
      mutationFn: DriverPayrollService.confirmAdvance,
      onSuccess: invalidate,
    }),
    updateAttendance: useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number
        data: Parameters<typeof DriverPayrollService.updateAttendance>[1]
      }) => DriverPayrollService.updateAttendance(id, data),
      onSuccess: invalidate,
    }),
    confirmAttendance: useMutation({
      mutationFn: DriverPayrollService.confirmAttendance,
      onSuccess: invalidate,
    }),
    createPayroll: useMutation({
      mutationFn: DriverPayrollService.createPayroll,
      onSuccess: invalidate,
    }),
    calculatePayroll: useMutation({
      mutationFn: DriverPayrollService.calculatePayroll,
      onSuccess: invalidate,
    }),
    updatePayrollItem: useMutation({
      mutationFn: ({
        id,
        itemId,
        data,
      }: {
        id: number
        itemId: number
        data: Parameters<typeof DriverPayrollService.updatePayrollItem>[2]
      }) => DriverPayrollService.updatePayrollItem(id, itemId, data),
      onSuccess: invalidate,
    }),
    approvePayroll: useMutation({
      mutationFn: DriverPayrollService.approvePayroll,
      onSuccess: invalidate,
    }),
    markPayrollPaid: useMutation({
      mutationFn: DriverPayrollService.markPayrollPaid,
      onSuccess: invalidate,
    }),
    lockPayroll: useMutation({
      mutationFn: DriverPayrollService.lockPayroll,
      onSuccess: invalidate,
    }),
  }
}
