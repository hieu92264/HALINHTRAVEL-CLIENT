import { httpService } from '@/services/http.service'

export type VehicleRun = {
  id: number
  run_no: string
  run_date: string
  pickup_time: string
  return_time?: string | null
  license_plate: string
  driver_name?: string | null
  customer_name?: string | null
  route_name?: string | null
  journey?: string | null
  freight_amount: string
  driver_wage: string
  status: string
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
  customer_name?: string
  route_name?: string
  shift_name: string
  license_plate: string
  effective_from: string
  effective_to?: string | null
  days: { weekday: number; pickup_time: string; return_time?: string | null }[]
  runs_count: number
}

const baseUrl = '/vehicle-operations'
export const VehicleOperationsService = {
  runs: (kind: 'worker' | 'tourist') =>
    httpService.get<VehicleRun[]>(`${baseUrl}/${kind}-vehicles`),
  rates: () => httpService.get<WorkerRate[]>(`${baseUrl}/worker-vehicle-rates`),
  schedules: () => httpService.get<WorkerSchedule[]>(`${baseUrl}/worker-vehicle-schedule-rules`),
}
