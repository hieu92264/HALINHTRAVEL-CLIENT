import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('@/services/http.service', () => ({
  httpService: { get },
}))

import { FinanceService } from './finance.service'

describe('FinanceService debt reports', () => {
  const params = { from_date: '2026-11-01', to_date: '2026-11-02' }
  const rows = [{ customer_id: 1, name: 'Khách hàng mẫu', opening_balance: '0.00', closing_balance: '100.00' }]

  beforeEach(() => {
    get.mockReset()
  })

  it.each([
    ['customer', '/other/reports/customer-debts', () => FinanceService.getCustomerDebts(params)],
    ['partner', '/other/reports/partner-debts', () => FinanceService.getPartnerDebts(params)],
    ['external driver', '/other/reports/external-driver-debts', () => FinanceService.getExternalDriverDebts(params)],
  ])('returns the metadata array for %s debt reports', async (_kind, url, request) => {
    get.mockResolvedValueOnce(rows)

    await expect(request()).resolves.toEqual(rows)
    expect(get).toHaveBeenCalledWith(url, { params })
  })
})
