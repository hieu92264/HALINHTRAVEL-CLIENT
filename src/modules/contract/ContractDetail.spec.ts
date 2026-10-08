import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import ContractDetail from './ContractDetail.vue'

const state = vi.hoisted(() => {
  const pending = { value: false }
  return {
    toast: { success: vi.fn(), error: vi.fn() },
    router: { push: vi.fn() },
    query: {
      data: {
        value: {
          id: 5,
          contract_no: 'HD20260005',
          customer_name: 'Nguyễn Thị Thu',
          contract_type: 'trip',
          signed_date: '2026-10-03',
          effective_from: '2026-10-08',
          effective_to: '2026-10-08',
          total_amount: '3100000',
          deposit_required: '1000000',
          payment_terms: null,
          terms: null,
          quotation_no: null,
          rental_request_no: null,
          status: 'active',
          is_active: true,
          items: [],
        },
      },
      isLoading: { value: false },
      isError: { value: false },
      refetch: vi.fn(),
    },
    mutations: {
      activate: { isPending: pending, mutateAsync: vi.fn() },
      complete: { isPending: pending, mutateAsync: vi.fn() },
      cancel: { isPending: pending, mutateAsync: vi.fn() },
      remove: { isPending: pending, mutateAsync: vi.fn() },
    },
  }
})

vi.mock('@/modules/auth/auth.store', () => ({
  useAuthStore: () => ({ user: { permissions: ['contracts.manage'] } }),
}))
vi.mock('@/modules/contract/contract.composables', () => ({
  useContractQuery: () => state.query,
  useContractMutations: () => state.mutations,
}))
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '5' } }),
  useRouter: () => state.router,
}))
vi.mock('vue-sonner', () => ({ toast: state.toast }))

function mountPage() {
  return mount(ContractDetail, {
    attachTo: document.body,
    global: {
      stubs: {
        ScheduleRulesPanel: true,
      },
    },
  })
}

function buttonByText(text: string): HTMLButtonElement {
  const button = Array.from(document.body.querySelectorAll('button')).find(
    (element) => element.textContent?.trim() === text,
  )
  if (!button) throw new Error(`Không tìm thấy nút ${text}.`)
  return button
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.clearAllMocks()
})

describe('ContractDetail confirmations', () => {
  it('only cancels a contract after the user confirms in the dialog', async () => {
    const wrapper = mountPage()

    buttonByText('Hủy').click()
    await nextTick()

    expect(state.mutations.cancel.mutateAsync).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain('Hủy hợp đồng')
    expect(document.body.textContent).toContain('HD20260005')

    buttonByText('Quay lại').click()
    await nextTick()
    expect(state.mutations.cancel.mutateAsync).not.toHaveBeenCalled()

    buttonByText('Hủy').click()
    await nextTick()
    buttonByText('Hủy hợp đồng').click()
    await nextTick()

    expect(state.mutations.cancel.mutateAsync).toHaveBeenCalledWith(5)
    wrapper.unmount()
  })

  it('keeps the dialog action error visible through the standard toast', async () => {
    state.mutations.cancel.mutateAsync.mockRejectedValueOnce(new Error('Không thể hủy'))
    const wrapper = mountPage()

    buttonByText('Hủy').click()
    await nextTick()
    buttonByText('Hủy hợp đồng').click()
    await nextTick()
    await nextTick()

    expect(state.toast.error).toHaveBeenCalledWith('Không thể cập nhật hợp đồng.')
    wrapper.unmount()
  })
})
