import { httpService } from '@/services/http.service'

export type VehicleRun = {
  id: number
  vehicle_id?: number | null
  run_no: string
  schedule_rule_id?: number | null
  customer_id?: number | null
  route_id?: number | null
  driver_id?: number | null
  partner_id?: number | null
  run_date: string
  return_date?: string | null
  pickup_time: string
  return_time?: string | null
  pickup_location?: string | null
  dropoff_location?: string | null
  license_plate: string
  vehicle_model?: string | null
  seat_count?: number | null
  driver_name?: string | null
  partner_name?: string | null
  hired_driver_name?: string | null
  customer_name?: string | null
  route_name?: string | null
  shift_name?: string | null
  journey?: string | null
  freight_amount: string
  driver_wage: string
  driver_wage_rate?: string
  driver_wage_is_overridden?: boolean
  partner_vehicle_cost?: string
  driver_collected_amount?: string
  company_collected_amount?: string
  driver_remitted_amount?: string
  driver_expense_amount?: string
  status: string
  is_company_vehicle?: boolean
  is_hired_driver?: boolean
  hired_driver_cost?: string | null
  note?: string | null
  actual_started_at?: string | null
  actual_completed_at?: string | null
  attendance?: { id: number; status: string; calculated_wage: string } | null
}

const baseUrl = '/vehicle-operations'
export const VehicleOperationsService = {
  runs: (kind: 'worker' | 'tourist', params?: Record<string, unknown>) =>
    httpService.get<VehicleRun[]>(`${baseUrl}/${kind}-vehicles`, { params }),
  workerRun: (id: number) => httpService.get<VehicleRun>(`${baseUrl}/worker-vehicles/${id}`),
  createWorkerRun: (data: Record<string, unknown>) =>
    httpService.post<VehicleRun>(`${baseUrl}/worker-vehicles`, data),
  updateWorkerRun: (id: number, data: Record<string, unknown>) =>
    httpService.patch<VehicleRun>(`${baseUrl}/worker-vehicles/${id}`, data),
  startWorkerRun: (id: number) =>
    httpService.post<VehicleRun>(`${baseUrl}/worker-vehicles/${id}/start`),
  completeWorkerRun: (id: number) =>
    httpService.post<VehicleRun>(`${baseUrl}/worker-vehicles/${id}/complete`),
  deleteWorkerRun: (id: number) => httpService.delete<void>(`${baseUrl}/worker-vehicles/${id}`),
  touristRun: (id: number) => httpService.get<VehicleRun>(`${baseUrl}/tourist-vehicles/${id}`),
  createTouristRun: (data: Record<string, unknown>) =>
    httpService.post<VehicleRun>(`${baseUrl}/tourist-vehicles`, data),
  updateTouristRun: (id: number, data: Record<string, unknown>) =>
    httpService.patch<VehicleRun>(`${baseUrl}/tourist-vehicles/${id}`, data),
  startTouristRun: (id: number) =>
    httpService.post<VehicleRun>(`${baseUrl}/tourist-vehicles/${id}/start`),
  completeTouristRun: (id: number) =>
    httpService.post<VehicleRun>(`${baseUrl}/tourist-vehicles/${id}/complete`),
  deleteTouristRun: (id: number) => httpService.delete<void>(`${baseUrl}/tourist-vehicles/${id}`),
}
