import { DispatchService } from '@/services/dispatch.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'

export const dispatchKeys = {
  schedules: ['dispatch', 'schedules'] as const,
  schedule: (id: number) => ['dispatch', 'schedules', id] as const,
  orders: ['dispatch', 'orders'] as const,
  order: (id: number) => ['dispatch', 'orders', id] as const,
  myOrders: ['dispatch', 'my-orders'] as const,
  myOrder: (id: number) => ['dispatch', 'my-orders', id] as const,
}
export const useSchedulesQuery = () =>
  useQuery({ queryKey: dispatchKeys.schedules, queryFn: DispatchService.getSchedules })
export const useScheduleQuery = (id: () => number) =>
  useQuery({
    queryKey: computed(() => dispatchKeys.schedule(id())),
    queryFn: () => DispatchService.getSchedule(id()),
    enabled: () => id() > 0,
  })
export const useOrdersQuery = () =>
  useQuery({ queryKey: dispatchKeys.orders, queryFn: DispatchService.getOrders })
export const useOrderQuery = (id: () => number) =>
  useQuery({
    queryKey: computed(() => dispatchKeys.order(id())),
    queryFn: () => DispatchService.getOrder(id()),
    enabled: () => id() > 0,
  })
export const useMyOrdersQuery = () =>
  useQuery({ queryKey: dispatchKeys.myOrders, queryFn: DispatchService.getMyOrders })
export const useMyOrderQuery = (id: () => number) =>
  useQuery({
    queryKey: computed(() => dispatchKeys.myOrder(id())),
    queryFn: () => DispatchService.getMyOrder(id()),
    enabled: () => id() > 0,
  })
export function useDispatchMutations() {
  const client = useQueryClient()
  const invalidate = () => client.invalidateQueries({ queryKey: ['dispatch'] })
  return {
    createSchedule: useMutation({
      mutationFn: DispatchService.createSchedule,
      onSuccess: invalidate,
    }),
    updateSchedule: useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number
        data: Parameters<typeof DispatchService.updateSchedule>[1]
      }) => DispatchService.updateSchedule(id, data),
      onSuccess: invalidate,
    }),
    cancelSchedule: useMutation({
      mutationFn: ({ id, note }: { id: number; note?: string }) =>
        DispatchService.cancelSchedule(id, note),
      onSuccess: invalidate,
    }),
    assign: useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number
        data: Parameters<typeof DispatchService.assign>[1]
      }) => DispatchService.assign(id, data),
      onSuccess: invalidate,
    }),
    substitute: useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number
        data: Parameters<typeof DispatchService.substitute>[1]
      }) => DispatchService.substitute(id, data),
      onSuccess: invalidate,
    }),
    removeAssignment: useMutation({
      mutationFn: DispatchService.removeAssignment,
      onSuccess: invalidate,
    }),
    createOrder: useMutation({ mutationFn: DispatchService.createOrder, onSuccess: invalidate }),
    assignOrder: useMutation({ mutationFn: DispatchService.assignOrder, onSuccess: invalidate }),
    startOrder: useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number
        data: Parameters<typeof DispatchService.startOrder>[1]
      }) => DispatchService.startOrder(id, data),
      onSuccess: invalidate,
    }),
    completeOrder: useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number
        data: Parameters<typeof DispatchService.completeOrder>[1]
      }) => DispatchService.completeOrder(id, data),
      onSuccess: invalidate,
    }),
    cancelOrder: useMutation({
      mutationFn: ({ id, note }: { id: number; note: string }) =>
        DispatchService.cancelOrder(id, note),
      onSuccess: invalidate,
    }),
  }
}
