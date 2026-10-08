import type { AvailabilityPayload, AvailabilityResult, RentalRequest } from './rental.types'

export function availabilityPayloadFromRequest(request: RentalRequest): AvailabilityPayload | null {
  if (!request.start_at || !request.end_at || !request.items.length) return null

  const totals = new Map<number, number>()
  for (const item of request.items) {
    totals.set(item.vehicle_type_id, (totals.get(item.vehicle_type_id) ?? 0) + item.quantity)
  }

  return {
    start_at: request.start_at,
    end_at: request.end_at,
    items: [...totals].map(([vehicle_type_id, quantity]) => ({ vehicle_type_id, quantity })),
  }
}

export function availabilityFailureMessage(result: AvailabilityResult): string {
  const shortages = result.vehicle_capacities
    .filter((capacity) => !capacity.is_sufficient)
    .map(
      (capacity) =>
        `${capacity.vehicle_type_name || 'Loại xe'} thiếu ${capacity.required_quantity - capacity.available_count} xe`,
    )

  if (!result.driver_capacity.is_sufficient) {
    shortages.push(
      `thiếu ${result.driver_capacity.required_quantity - result.driver_capacity.available_count} tài xế`,
    )
  }

  return shortages.length
    ? `Không đủ năng lực: ${shortages.join('; ')}.`
    : 'Không đủ năng lực để thực hiện yêu cầu.'
}
