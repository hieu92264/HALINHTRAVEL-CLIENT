import type { AvailabilityPayload } from './dispatch.types'

export type CapacityItem = {
  id: number
  vehicleTypeId: number | null
  quantity: number
}

export type CapacityForm = {
  startAt: string
  endAt: string
  ownership: '' | 'company' | 'partner'
  partnerId: number | null
  items: CapacityItem[]
}

export type CapacityFormErrors = {
  startAt?: string
  endAt?: string
  items?: string
}

export function createCapacityItem(id: number): CapacityItem {
  return { id, vehicleTypeId: null, quantity: 1 }
}

export function validateCapacityForm(form: CapacityForm): CapacityFormErrors {
  const errors: CapacityFormErrors = {}
  if (!form.startAt) errors.startAt = 'Chọn thời điểm bắt đầu.'
  if (!form.endAt) errors.endAt = 'Chọn thời điểm kết thúc.'
  if (form.startAt && form.endAt && new Date(form.endAt) <= new Date(form.startAt)) {
    errors.endAt = 'Thời điểm kết thúc phải sau thời điểm bắt đầu.'
  }

  const vehicleTypeIds = form.items.map((item) => item.vehicleTypeId)
  if (vehicleTypeIds.some((id) => id === null)) errors.items = 'Chọn loại xe cho từng dòng yêu cầu.'
  else if (form.items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) errors.items = 'Số lượng xe phải là số nguyên lớn hơn 0.'
  else if (new Set(vehicleTypeIds).size !== vehicleTypeIds.length) errors.items = 'Mỗi loại xe chỉ được chọn một lần.'

  return errors
}

export function isCapacityFormValid(form: CapacityForm): boolean {
  return Object.keys(validateCapacityForm(form)).length === 0
}

export function toAvailabilityPayload(form: CapacityForm): AvailabilityPayload {
  return {
    start_at: form.startAt,
    end_at: form.endAt,
    items: form.items.map((item) => ({ vehicle_type_id: item.vehicleTypeId!, quantity: item.quantity })),
    ownership_type: form.ownership || null,
    partner_id: form.partnerId,
  }
}
