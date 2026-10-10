import { describe, expect, it } from 'vitest'
import { createCapacityItem, isCapacityFormValid, toAvailabilityPayload, validateCapacityForm } from './capacity-form'
import type { CapacityForm } from './capacity-form'

const validForm = (): CapacityForm => ({
  startAt: '2026-10-20T08:00',
  endAt: '2026-10-20T12:00',
  ownership: '',
  partnerId: null,
  items: [{ ...createCapacityItem(1), vehicleTypeId: 3, quantity: 2 }],
})

describe('capacity form', () => {
  it('requires valid time and vehicle demand before checking availability', () => {
    const form = validForm()
    expect(isCapacityFormValid(form)).toBe(true)

    form.endAt = '2026-10-20T07:00'
    expect(validateCapacityForm(form).endAt).toContain('sau')

    form.endAt = '2026-10-20T12:00'
    form.items[0]!.vehicleTypeId = null
    expect(validateCapacityForm(form).items).toContain('Chọn loại xe')
  })

  it('rejects duplicate vehicle types and invalid quantities', () => {
    const form = validForm()
    form.items.push({ ...createCapacityItem(2), vehicleTypeId: 3, quantity: 1 })
    expect(validateCapacityForm(form).items).toContain('một lần')

    form.items = [{ ...createCapacityItem(1), vehicleTypeId: 3, quantity: 0 }]
    expect(validateCapacityForm(form).items).toContain('lớn hơn 0')
  })

  it('builds the Dispatch availability payload without changing API names', () => {
    const form = validForm()
    form.ownership = 'partner'
    form.partnerId = 7

    expect(toAvailabilityPayload(form)).toEqual({
      start_at: '2026-10-20T08:00',
      end_at: '2026-10-20T12:00',
      items: [{ vehicle_type_id: 3, quantity: 2 }],
      ownership_type: 'partner',
      partner_id: 7,
    })
  })
})
