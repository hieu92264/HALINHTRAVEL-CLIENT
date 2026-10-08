import { describe, expect, it } from 'vitest'
import {
  contractFormSchema,
  contractFromQuotationSchema,
  scheduleRuleSchema,
} from '@/modules/contract/schemas/contract.schema'
import { quotationFormSchema } from './quotation.schema'
import { rentalRequestFormSchema } from './rental-request.schema'
import { quotationStatusLabel } from '../rental.format'

describe('rental and contract schemas', () => {
  it('requires custom journeys and valid rental times', () => {
    const result = rentalRequestFormSchema.safeParse({
      customer_id: 1,
      source: '',
      requested_at: '2026-10-01T08:00',
      service_type: 'tourism',
      start_at: '2026-10-02T08:00',
      end_at: '2026-10-01T08:00',
      trip_mode: 'custom',
      route_id: 0,
      pickup_location: '',
      dropoff_location: '',
      note: '',
      items: [{ vehicle_type_id: 1, quantity: 1, note: '' }],
    })
    expect(result.success).toBe(false)
  })
  it('rejects invalid quotation dates and contract deposits', () => {
    expect(
      quotationFormSchema.safeParse({
        customer_id: 1,
        rental_request_id: null,
        quotation_date: '2026-10-02',
        valid_until: '2026-10-01',
        discount_amount: 0,
        payment_terms: '',
        items: [
          { vehicle_type_id: 1, route_id: null, description: '', quantity: 1, unit_price: 0 },
        ],
      }).success,
    ).toBe(false)
    expect(
      contractFormSchema.safeParse({
        customer_id: 1,
        contract_type: 'trip',
        signed_date: '',
        effective_from: '2026-10-01',
        effective_to: '2026-10-01',
        deposit_required: 101,
        payment_terms: '',
        terms: '',
        items: [
          {
            vehicle_type_id: 1,
            route_id: null,
            service_type: 'tourism',
            quantity: 1,
            unit_price: 100,
            driver_wage: 0,
            pickup_location: '',
            dropoff_location: '',
            note: '',
          },
        ],
      }).success,
    ).toBe(false)
  })
  it('requires a request and expiry for quotations and limits manual contracts to principle', () => {
    expect(
      quotationFormSchema.safeParse({
        customer_id: 1,
        rental_request_id: 1,
        quotation_date: '2026-10-02',
        valid_until: '2026-10-05',
        discount_amount: 0,
        payment_terms: '',
        items: [
          { vehicle_type_id: 1, route_id: null, description: '', quantity: 1, unit_price: 0 },
        ],
      }).success,
    ).toBe(true)
    expect(
      contractFormSchema.safeParse({
        customer_id: 1,
        contract_type: 'trip',
        signed_date: '',
        effective_from: '2026-10-01',
        effective_to: '',
        deposit_required: 0,
        payment_terms: '',
        terms: '',
        items: [],
      }).success,
    ).toBe(false)
    expect(
      contractFromQuotationSchema.safeParse({
        quotation_id: 1,
        contract_type: 'trip',
        signed_date: '',
        effective_from: '2026-10-01',
        effective_to: '2026-10-02',
        deposit_required: 0,
        payment_terms: '',
        terms: '',
      }).success,
    ).toBe(true)
  })
  it('displays a superseded quotation explicitly', () => {
    expect(quotationStatusLabel('superseded')).toBe('Đã thay thế')
  })
  it('rejects duplicate schedule days', () => {
    expect(
      scheduleRuleSchema.safeParse({
        contract_item_id: 1,
        route_id: null,
        effective_from: '2026-10-01',
        effective_to: '2026-10-31',
        default_vehicle_id: null,
        default_driver_id: null,
        note: '',
        days: [
          { weekday: 'Mon', pickup_time: '08:00', return_time: '10:00', shift_name: '' },
          { weekday: 'Mon', pickup_time: '08:00', return_time: '11:00', shift_name: '' },
        ],
      }).success,
    ).toBe(false)
  })
})
