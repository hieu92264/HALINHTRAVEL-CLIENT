import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'

const financeService = vi.hoisted(() => ({
  getCustomerDebts: vi.fn(),
  getPartnerDebts: vi.fn(),
  getExternalDriverDebts: vi.fn(),
}))

vi.mock('@/services/finance.service', () => ({ FinanceService: financeService }))
vi.mock('@/services/driver-payroll.service', () => ({ DriverPayrollService: {} }))

import {
  useCustomerDebtsQuery,
  useExternalDriverDebtsQuery,
  usePartnerDebtsQuery,
} from './finance.composables'

describe('debt report queries', () => {
  it('resolves all three direct metadata arrays without a TanStack undefined-data error', async () => {
    const rows = [{ name: 'Dữ liệu mẫu', opening_balance: '0.00', closing_balance: '100.00' }]
    financeService.getCustomerDebts.mockResolvedValue(rows)
    financeService.getPartnerDebts.mockResolvedValue(rows)
    financeService.getExternalDriverDebts.mockResolvedValue(rows)
    const params = () => ({ from_date: '2026-11-01', to_date: '2026-11-02' })
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const Harness = defineComponent({
      setup: () => ({
        customer: useCustomerDebtsQuery(params),
        partner: usePartnerDebtsQuery(params),
        externalDriver: useExternalDriverDebtsQuery(params),
      }),
      template: '<div />',
    })
    const wrapper = mount(Harness, {
      global: { plugins: [[VueQueryPlugin, { queryClient }]] },
    })

    await flushPromises()
    await flushPromises()

    for (const query of [wrapper.vm.customer, wrapper.vm.partner, wrapper.vm.externalDriver]) {
      expect(query.data.value).toEqual(rows)
      expect(query.isError.value).toBe(false)
    }

    wrapper.unmount()
    queryClient.clear()
  })
})
