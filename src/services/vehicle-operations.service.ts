import { httpService } from '@/services/http.service'

export type VehicleRun = {
  id: number
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
  driver_name?: string | null
  hired_driver_name?: string | null
  customer_name?: string | null
  route_name?: string | null
  shift_name?: string | null
  journey?: string | null
  freight_amount: string
  driver_wage: string
  status: string
  is_company_vehicle?: boolean
  is_hired_driver?: boolean
  hired_driver_cost?: string | null
  note?: string | null
  actual_started_at?: string | null
  actual_completed_at?: string | null
  attendance?: { id: number; status: string; calculated_wage: string } | null
}
export type WorkerRate = {
  id: number
  route_id: number
  route_name?: string
  license_plate: string
  freight_amount: string
  driver_wage: string
  effective_from: string
  effective_to?: string | null
}
export type WorkerSchedule = {
  id: number
  customer_id: number
  route_id: number
  driver_id?: number | null
  partner_id?: number | null
  customer_name?: string
  route_name?: string
  driver_name?: string | null
  shift_name: string
  license_plate: string
  effective_from: string
  effective_to?: string | null
  pickup_location: string
  dropoff_location: string
  is_company_vehicle: boolean
  is_hired_driver: boolean
  hired_driver_name?: string | null
  hired_driver_cost?: string | null
  note?: string | null
  is_active?: boolean
  days: { weekday: number; pickup_time: string; return_time?: string | null }[]
  runs_count: number
}

const baseUrl = '/vehicle-operations'
export const VehicleOperationsService = {
  runs: (kind: 'worker' | 'tourist', params?: Record<string, unknown>) =>
    httpService.get<VehicleRun[]>(`${baseUrl}/${kind}-vehicles`, { params }),
  workerRun: (id: number) => httpService.get<VehicleRun>(`${baseUrl}/worker-vehicles/${id}`),
  createWorkerRun: (data: Record<string, unknown>) => httpService.post<VehicleRun>(`${baseUrl}/worker-vehicles`, data),
  updateWorkerRun: (id: number, data: Record<string, unknown>) => httpService.patch<VehicleRun>(`${baseUrl}/worker-vehicles/${id}`, data),
  startWorkerRun: (id: number) => httpService.post<VehicleRun>(`${baseUrl}/worker-vehicles/${id}/start`),
  completeWorkerRun: (id: number) => httpService.post<VehicleRun>(`${baseUrl}/worker-vehicles/${id}/complete`),
  deleteWorkerRun: (id: number) => httpService.delete<void>(`${baseUrl}/worker-vehicles/${id}`),
  rates: () => httpService.get<WorkerRate[]>(`${baseUrl}/worker-vehicle-rates`),
  schedules: () => httpService.get<WorkerSchedule[]>(`${baseUrl}/worker-vehicle-schedule-rules`),
  createSchedule: (data: Record<string, unknown>) => httpService.post<WorkerSchedule>(`${baseUrl}/worker-vehicle-schedule-rules`, data),
  updateSchedule: (id: number, data: Record<string, unknown>) => httpService.patch<WorkerSchedule>(`${baseUrl}/worker-vehicle-schedule-rules/${id}`, data),
  deleteSchedule: (id: number) => httpService.delete<void>(`${baseUrl}/worker-vehicle-schedule-rules/${id}`),
}
