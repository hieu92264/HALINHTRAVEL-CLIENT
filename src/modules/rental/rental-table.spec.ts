import { describe, expect, it } from 'vitest'
import { canManageQuotationDraft } from './rental-table'
import type { Quotation } from './rental.types'

const quotation = (status: Quotation['status'], validUntil: string): Quotation => ({
  id: 1,
  quotation_no: 'BG20260001',
  rental_request_id: 1,
  rental_request_no: 'YC20260001',
  customer_id: 1,
  customer_name: 'Khách hàng',
  customer_email: null,
  quotation_date: '2026-10-01',
  valid_until: validUntil,
  subtotal: '0',
  discount_amount: '0',
  total_amount: '0',
  payment_terms: null,
  status,
  user_name_created: null,
  user_name_updated: null,
  created_at: null,
  updated_at: null,
  approved_by: null,
  approved_at: null,
  customer_responded_at: null,
  customer_response_note: null,
  items: [],
})

describe('quotation table rules', () => {
  it('keeps draft quotations manageable without a valid-until date', () => {
    expect(canManageQuotationDraft(quotation('draft', ''))).toBe(true)
    expect(canManageQuotationDraft(quotation('draft', '2020-01-01'))).toBe(true)
  })

  it('does not expose management actions for non-draft quotations', () => {
    expect(canManageQuotationDraft(quotation('sent', '2030-01-01'))).toBe(false)
  })
})
