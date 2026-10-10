import type {
  AssignmentPayload,
  CompleteOrderPayload,
  DispatchOrder,
  SchedulePayload,
  StartOrderPayload,
  TripAssignment,
  TripSchedule,
} from '@/modules/dispatch/dispatch.types'
import { httpService } from '@/services/http.service'

const url = '/dispatch'
export class DispatchService {
  static getSchedules() {
    return httpService.get<TripSchedule[]>(`${url}/trip-schedules`)
  }
  static getSchedule(id: number) {
    return httpService.get<TripSchedule>(`${url}/trip-schedules/${id}`)
  }
  static createSchedule(data: SchedulePayload) {
    return httpService.post<TripSchedule, SchedulePayload>(`${url}/trip-schedules`, data)
  }
  static updateSchedule(id: number, data: Partial<SchedulePayload>) {
    return httpService.patch<TripSchedule, Partial<SchedulePayload>>(
      `${url}/trip-schedules/${id}`,
      data,
    )
  }
  static cancelSchedule(id: number, note?: string) {
    return httpService.post<TripSchedule, { note?: string }>(`${url}/trip-schedules/${id}/cancel`, {
      note,
    })
  }
  static getAssignments(scheduleId: number) {
    return httpService.get<TripAssignment[]>(`${url}/trip-schedules/${scheduleId}/assignments`)
  }
  static assign(scheduleId: number, data: AssignmentPayload) {
    return httpService.post<TripAssignment, AssignmentPayload>(
      `${url}/trip-schedules/${scheduleId}/assignments`,
      data,
    )
  }
  static substitute(scheduleId: number, data: AssignmentPayload) {
    return httpService.post<TripAssignment, AssignmentPayload>(
      `${url}/trip-schedules/${scheduleId}/assignments/substitute`,
      data,
    )
  }
  static removeAssignment(id: number) {
    return httpService.delete<void>(`${url}/trip-assignments/${id}`)
  }
  static getOrders() {
    return httpService.get<DispatchOrder[]>(`${url}/dispatch-orders`)
  }
  static getOrder(id: number) {
    return httpService.get<DispatchOrder>(`${url}/dispatch-orders/${id}`)
  }
  static createOrder(scheduleId: number) {
    return httpService.post<DispatchOrder>(`${url}/trip-schedules/${scheduleId}/dispatch-order`)
  }
  static assignOrder(id: number) {
    return httpService.post<DispatchOrder>(`${url}/dispatch-orders/${id}/assign`)
  }
  static startOrder(id: number, data: StartOrderPayload) {
    return httpService.post<DispatchOrder, StartOrderPayload>(
      `${url}/dispatch-orders/${id}/start`,
      data,
    )
  }
  static completeOrder(id: number, data: CompleteOrderPayload) {
    return httpService.post<DispatchOrder, CompleteOrderPayload>(
      `${url}/dispatch-orders/${id}/complete`,
      data,
    )
  }
  static cancelOrder(id: number, note: string) {
    return httpService.post<DispatchOrder, { note: string }>(
      `${url}/dispatch-orders/${id}/cancel`,
      { note },
    )
  }
  static getMyOrders() {
    return httpService.get<DispatchOrder[]>(`${url}/my-orders`)
  }
  static getMyOrder(id: number) {
    return httpService.get<DispatchOrder>(`${url}/my-orders/${id}`)
  }
}
