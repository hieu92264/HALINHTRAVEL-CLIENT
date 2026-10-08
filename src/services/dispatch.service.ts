import type { AssignmentPayload, CompletionConfirmationPayload, CompletionReportPayload, DispatchOrder, TripAssignment, TripSchedule } from '@/modules/dispatch/dispatch.types'
import { httpService } from '@/services/http.service'

const baseUrl = '/dispatch'
export class DispatchService {
  static getSchedules(): Promise<TripSchedule[]> { return httpService.get(`${baseUrl}/trip-schedules`) }
  static getSchedule(id: number): Promise<TripSchedule> { return httpService.get(`${baseUrl}/trip-schedules/${id}`) }
  static createSchedule(payload: Partial<TripSchedule>): Promise<TripSchedule> { return httpService.post(`${baseUrl}/trip-schedules`, payload) }
  static updateSchedule(id: number, payload: Partial<TripSchedule>): Promise<TripSchedule> { return httpService.patch(`${baseUrl}/trip-schedules/${id}`, payload) }
  static cancelSchedule(id: number): Promise<TripSchedule> { return httpService.post(`${baseUrl}/trip-schedules/${id}/cancel`) }
  static getAssignments(scheduleId: number): Promise<TripAssignment[]> { return httpService.get(`${baseUrl}/trip-schedules/${scheduleId}/assignments`) }
  static assign(scheduleId: number, payload: AssignmentPayload): Promise<TripAssignment> { return httpService.post(`${baseUrl}/trip-schedules/${scheduleId}/assignments`, payload) }
  static substitute(scheduleId: number, payload: AssignmentPayload): Promise<TripAssignment> { return httpService.post(`${baseUrl}/trip-schedules/${scheduleId}/assignments/substitute`, payload) }
  static issue(scheduleId: number): Promise<DispatchOrder> { return httpService.post(`${baseUrl}/trip-schedules/${scheduleId}/orders`) }
  static getOrders(): Promise<DispatchOrder[]> { return httpService.get(`${baseUrl}/orders`) }
  static getOrder(id: number): Promise<DispatchOrder> { return httpService.get(`${baseUrl}/orders/${id}`) }
  static assignOrder(id: number): Promise<DispatchOrder> { return httpService.post(`${baseUrl}/orders/${id}/assign`) }
  static startOrder(id: number): Promise<DispatchOrder> { return httpService.post(`${baseUrl}/orders/${id}/start`) }
  static reportCompletion(id: number, payload: CompletionReportPayload): Promise<DispatchOrder> { return httpService.post(`${baseUrl}/orders/${id}/report-completion`, payload) }
  static confirmCompletion(id: number, payload: CompletionConfirmationPayload): Promise<DispatchOrder> { return httpService.post(`${baseUrl}/orders/${id}/confirm-completion`, payload) }
  static returnCompletion(id: number, review_note: string): Promise<DispatchOrder> { return httpService.post(`${baseUrl}/orders/${id}/return-completion`, { review_note }) }
  static cancelOrder(id: number): Promise<DispatchOrder> { return httpService.post(`${baseUrl}/orders/${id}/cancel`) }
  static getMyOrders(): Promise<DispatchOrder[]> { return httpService.get(`${baseUrl}/my-orders`) }
  static getMyOrder(id: number): Promise<DispatchOrder> { return httpService.get(`${baseUrl}/my-orders/${id}`) }
  static startMyOrder(id: number): Promise<DispatchOrder> { return httpService.post(`${baseUrl}/my-orders/${id}/start`) }
  static reportMyCompletion(id: number, payload: CompletionReportPayload): Promise<DispatchOrder> { return httpService.post(`${baseUrl}/my-orders/${id}/report-completion`, payload) }
}
