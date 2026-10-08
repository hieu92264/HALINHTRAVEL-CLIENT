import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'
import type { AssignmentPayload, CompletionConfirmationPayload, CompletionReportPayload } from './dispatch.types'
import { DispatchService } from '@/services/dispatch.service'

export const dispatchQueryKeys = { schedules: ['dispatch', 'schedules'] as const, schedule: (id: number) => ['dispatch', 'schedules', id] as const, orders: ['dispatch', 'orders'] as const, order: (id: number) => ['dispatch', 'orders', id] as const, myOrders: ['dispatch', 'my-orders'] as const, myOrder: (id: number) => ['dispatch', 'my-orders', id] as const }
const invalidateDispatch = (client: ReturnType<typeof useQueryClient>) => Promise.all([client.invalidateQueries({ queryKey: dispatchQueryKeys.schedules }), client.invalidateQueries({ queryKey: dispatchQueryKeys.orders }), client.invalidateQueries({ queryKey: dispatchQueryKeys.myOrders })])
export const useTripSchedules = () => useQuery({ queryKey: dispatchQueryKeys.schedules, queryFn: DispatchService.getSchedules })
export const useDispatchOrders = () => useQuery({ queryKey: dispatchQueryKeys.orders, queryFn: DispatchService.getOrders })
export const useMyDispatchOrders = () => useQuery({ queryKey: dispatchQueryKeys.myOrders, queryFn: DispatchService.getMyOrders })
export const useMyDispatchOrder = (id: MaybeRefOrGetter<number>) => useQuery({ queryKey: computed(() => dispatchQueryKeys.myOrder(toValue(id))), queryFn: () => DispatchService.getMyOrder(toValue(id)), enabled: computed(() => !!toValue(id)) })
export function useDispatchMutations() {
  const client = useQueryClient(); const options = { onSuccess: () => invalidateDispatch(client) }
  return {
    assign: useMutation({ mutationFn: ({ id, payload }: { id: number; payload: AssignmentPayload }) => DispatchService.assign(id, payload), ...options }),
    substitute: useMutation({ mutationFn: ({ id, payload }: { id: number; payload: AssignmentPayload }) => DispatchService.substitute(id, payload), ...options }),
    issue: useMutation({ mutationFn: DispatchService.issue, ...options }),
    assignOrder: useMutation({ mutationFn: DispatchService.assignOrder, ...options }),
    cancelOrder: useMutation({ mutationFn: DispatchService.cancelOrder, ...options }),
    returnCompletion: useMutation({ mutationFn: ({ id, reviewNote }: { id: number; reviewNote: string }) => DispatchService.returnCompletion(id, reviewNote), ...options }),
    startMyOrder: useMutation({ mutationFn: DispatchService.startMyOrder, ...options }),
    reportMyCompletion: useMutation({ mutationFn: ({ id, payload }: { id: number; payload: CompletionReportPayload }) => DispatchService.reportMyCompletion(id, payload), ...options }),
    confirmCompletion: useMutation({ mutationFn: ({ id, payload }: { id: number; payload: CompletionConfirmationPayload }) => DispatchService.confirmCompletion(id, payload), ...options }),
  }
}
