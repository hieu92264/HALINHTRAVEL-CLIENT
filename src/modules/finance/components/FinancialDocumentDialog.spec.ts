import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import FinancialDocumentDialog from './FinancialDocumentDialog.vue'

const state = vi.hoisted(() => ({
  contracts: {
    data: { value: [
      { id: 11, contract_no: 'HD20260011', customer_id: 1, is_active: true },
      { id: 12, contract_no: 'HD20260012', customer_id: 1, is_active: true },
      { id: 21, contract_no: 'HD20260021', customer_id: 2, is_active: true },
    ] },
    isLoading: { value: false },
    isError: { value: false },
  },
  customers: { data: { value: [{ id: 1, name: 'Khách hàng A' }, { id: 2, name: 'Khách hàng B' }] } },
}))

vi.mock('@/modules/contract/contract.composables', () => ({
  useContractsQuery: () => state.contracts,
}))
vi.mock('@/modules/master-data/customer/composables/useCustomerQueries', () => ({
  useCustomerQuery: () => state.customers,
}))
vi.mock('@/modules/master-data/expense-type/composables/useExpenseTypeQueries', () => ({
  useExpenseTypeQuery: () => ({ data: { value: [] } }),
}))
vi.mock('@/modules/master-data/partner/composables/usePartnerQueries', () => ({
  usePartnerQuery: () => ({ data: { value: [] } }),
}))

function mountDialog() {
  return mount(FinancialDocumentDialog, {
    attachTo: document.body,
    props: { open: true, kind: 'receipt', row: null },
    global: {
      stubs: {
        Dialog: { template: '<div><slot /></div>' },
        DialogContent: { template: '<div><slot /></div>' },
        DialogHeader: { template: '<div><slot /></div>' },
        DialogTitle: { template: '<div><slot /></div>' },
        DialogDescription: { template: '<div><slot /></div>' },
        DialogFooter: { template: '<div><slot /></div>' },
      },
    },
  })
}

async function selectCustomer(wrapper: ReturnType<typeof mount>, id: string) {
  await wrapper.find('select').setValue(id)
  await nextTick()
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.clearAllMocks()
})

describe('FinancialDocumentDialog contract picker', () => {
  it('filters by contract code and emits the selected contract ID', async () => {
    const wrapper = mountDialog()
    await selectCustomer(wrapper, '1')

    const search = wrapper.find('input[type="search"]')
    await search.setValue('0012')
    await nextTick()
    expect(wrapper.text()).toContain('HD20260012')
    expect(wrapper.text()).not.toContain('HD20260021')

    await wrapper.find('button[data-contract-id="12"]').trigger('click')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('save')?.[0]?.[0]).toMatchObject({ contract_id: 12 })
    wrapper.unmount()
  })

  it('clears the selected contract when the customer changes', async () => {
    const wrapper = mountDialog()
    await selectCustomer(wrapper, '1')
    await wrapper.find('input[type="search"]').setValue('HD20260011')
    await wrapper.find('button[data-contract-id="11"]').trigger('click')

    await selectCustomer(wrapper, '2')

    expect((wrapper.find('input[type="search"]').element as HTMLInputElement).value).toBe('')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('save')).toBeUndefined()
    expect(wrapper.text()).toContain('Vui lòng chọn mã hợp đồng.')
    wrapper.unmount()
  })

  it('does not submit a required receipt contract until an option is selected', async () => {
    const wrapper = mountDialog()
    await selectCustomer(wrapper, '1')
    await wrapper.find('input[type="search"]').setValue('Mã không tồn tại')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('save')).toBeUndefined()
    expect(wrapper.text()).toContain('Vui lòng chọn mã hợp đồng.')
    wrapper.unmount()
  })
})
