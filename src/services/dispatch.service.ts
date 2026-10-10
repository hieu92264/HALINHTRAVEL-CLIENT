import type { AssignmentPayload, AvailabilityPayload, AvailabilityResult, CompletionConfirmationPayload, CompletionReportPayload, DispatchOrder, StartOrderPayload, TripAssignment, TripSchedule, TripSchedulePayload } from '@/modules/dispatch/dispatch.types'
import { httpService } from '@/services/http.service'

const baseUrl = '/dispatch'
export class DispatchService {
  static getSchedules(): Promise<TripSchedule[]> { return httpService.get(`${baseUrl}/trip-schedules`) }
  static getSchedule(id: number): Promise<TripSchedule> { return httpService.get(`${baseUrl}/trip-schedules/${id}`) }
  static createSchedule(payload: TripSchedulePayload): Promise<TripSchedule> { return httpService.post(`${baseUrl}/trip-schedules`, payload) }
  static updateSchedule(id: number, payload: Partial<Omit<TripSchedulePayload, 'contract_id'>>): Promise<TripSchedule> { return httpService.patch(`${baseUrl}/trip-schedules/${id}`, payload) }
  static deactivateSchedule(id: number): Promise<void> { return httpService.delete(`${baseUrl}/trip-schedules/${id}`) }
  static cancelSchedule(id: number, note?: string | null): Promise<TripSchedule> { return httpService.post(`${baseUrl}/trip-schedules/${id}/cancel`, { note }) }
  static checkAvailability(payload: AvailabilityPayload): Promise<AvailabilityResult> { return httpService.post(`${baseUrl}/availability`, payload) }
  static getAssignments(scheduleId: number): Promise<TripAssignment[]> { return httpService.get(`${baseUrl}/trip-schedules/${scheduleId}/assignments`) }
  static assign(scheduleId: number, payload: AssignmentPayload): Promise<TripAssignment> { return httpService.post(`${baseUrl}/trip-schedules/${scheduleId}/assignments`, payload) }
  static substitute(scheduleId: number, payload: AssignmentPayload): Promise<TripAssignment> { return httpService.post(`${baseUrl}/trip-schedules/${scheduleId}/assignments/substitute`, payload) }
  static removeAssignment(id: number): Promise<TripSchedule> { return httpService.delete(`${baseUrl}/trip-assignments/${id}`) }
  static issue(scheduleId: number): Promise<DispatchOrder> { return httpService.post(`${baseUrl}/trip-schedules/${scheduleId}/orders`) }
  static getOrders(): Promise<DispatchOrder[]> { return httpService.get(`${baseUrl}/orders`) }
  static getOrder(id: number): Promise<DispatchOrder> { return httpService.get(`${baseUrl}/orders/${id}`) }
  static assignOrder(id: number): Promise<DispatchOrder> { return httpService.post(`${baseUrl}/orders/${id}/assign`) }
  static confirmCompletion(id: number, payload: CompletionConfirmationPayload): Promise<DispatchOrder> { return httpService.post(`${baseUrl}/orders/${id}/confirm-completion`, payload) }
  static returnCompletion(id: number, review_note: string): Promise<DispatchOrder> { return httpService.post(`${baseUrl}/orders/${id}/return-completion`, { review_note }) }
  static cancelOrder(id: number, note: string): Promise<DispatchOrder> { return httpService.post(`${baseUrl}/orders/${id}/cancel`, { note }) }
  static getMyOrders(): Promise<DispatchOrder[]> { return httpService.get(`${baseUrl}/my-orders`) }
  static getMyOrder(id: number): Promise<DispatchOrder> { return httpService.get(`${baseUrl}/my-orders/${id}`) }
  static startMyOrder(id: number, payload: StartOrderPayload): Promise<DispatchOrder> { return httpService.post(`${baseUrl}/my-orders/${id}/start`, payload) }
  static reportMyCompletion(id: number, payload: CompletionReportPayload): Promise<DispatchOrder> { return httpService.post(`${baseUrl}/my-orders/${id}/report-completion`, payload) }
}
