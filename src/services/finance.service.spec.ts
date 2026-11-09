import { beforeEach, describe, expect, it, vi } from 'vitest'

const { get, downloadPdf, downloadExcel } = vi.hoisted(() => ({ get: vi.fn(), downloadPdf: vi.fn(), downloadExcel: vi.fn() }))

vi.mock('@/services/http.service', () => ({
  httpService: { get, downloadPdf, downloadExcel },
}))

import { FinanceService } from './finance.service'

describe('FinanceService debt reports', () => {
  const params = { from_date: '2026-11-01', to_date: '2026-11-02' }
  const rows = [{ customer_id: 1, name: 'Khách hàng mẫu', opening_balance: '0.00', closing_balance: '100.00' }]

  beforeEach(() => {
    get.mockReset()
    downloadPdf.mockReset()
    downloadExcel.mockReset()
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

  it.each(['receipts', 'vehicle-expenses', 'general-expenses', 'partner-payments'] as const)(
    'downloads %s in the requested format',
    async (table) => {
      downloadPdf.mockResolvedValueOnce({ blob: new Blob(), filename: 'thu-chi.pdf', contentType: 'application/pdf' })
      downloadExcel.mockResolvedValueOnce({ blob: new Blob(), filename: 'thu-chi.xlsx', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      await FinanceService.downloadExport(table, 'pdf')
      await FinanceService.downloadExport(table, 'xlsx')

      expect(downloadPdf).toHaveBeenCalledWith(`/finance/exports/${table}`, { params: { format: 'pdf' } })
      expect(downloadExcel).toHaveBeenCalledWith(`/finance/exports/${table}`, { params: { format: 'xlsx' } })
    },
  )
})
