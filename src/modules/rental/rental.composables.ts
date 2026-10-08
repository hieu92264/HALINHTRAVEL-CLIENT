import { RentalService } from '@/services/rental.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'

export const rentalQueryKeys = {
  requests: ['rental', 'requests'] as const,
  request: (id: number) => ['rental', 'requests', id] as const,
  quotations: ['rental', 'quotations'] as const,
  quotation: (id: number) => ['rental', 'quotations', id] as const,
  publicQuotation: (token: string) => ['rental', 'public-quotation', token] as const,
}

const invalidateRental = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: rentalQueryKeys.requests }),
    queryClient.invalidateQueries({ queryKey: rentalQueryKeys.quotations }),
  ])
}

export const useRentalRequestsQuery = () =>
  useQuery({ queryKey: rentalQueryKeys.requests, queryFn: RentalService.getRequests })

export const useRentalRequestQuery = (id: () => number) =>
  useQuery({
    queryKey: computed(() => rentalQueryKeys.request(id())),
    queryFn: () => RentalService.getRequest(id()),
    enabled: () => Number.isInteger(id()) && id() > 0,
  })

export const useQuotationsQuery = () =>
  useQuery({ queryKey: rentalQueryKeys.quotations, queryFn: RentalService.getQuotations })

export const useQuotationQuery = (id: () => number) =>
  useQuery({
    queryKey: computed(() => rentalQueryKeys.quotation(id())),
    queryFn: () => RentalService.getQuotation(id()),
    enabled: () => Number.isInteger(id()) && id() > 0,
  })

export const useRentalMutations = () => {
  const queryClient = useQueryClient()
  const options = { onSuccess: () => invalidateRental(queryClient) }

  return {
    createRequest: useMutation({ mutationFn: RentalService.createRequest, ...options }),
    updateRequest: useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number
        data: Parameters<typeof RentalService.updateRequest>[1]
      }) => RentalService.updateRequest(id, data),
      ...options,
    }),
    deleteRequest: useMutation({ mutationFn: RentalService.deleteRequest, ...options }),
    createQuotation: useMutation({ mutationFn: RentalService.createQuotation, ...options }),
    updateQuotation: useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number
        data: Parameters<typeof RentalService.updateQuotation>[1]
      }) => RentalService.updateQuotation(id, data),
      ...options,
    }),
    deleteQuotation: useMutation({ mutationFn: RentalService.deleteQuotation, ...options }),
    sendQuotation: useMutation({ mutationFn: RentalService.sendQuotation, ...options }),
    expireQuotation: useMutation({ mutationFn: RentalService.expireQuotation, ...options }),
    recordCustomerResponse: useMutation({
      mutationFn: ({
        id,
        accepted,
        note,
      }: {
        id: number
        accepted: boolean
        note?: string | null
      }) => RentalService.recordCustomerResponse(id, { accepted, note }),
      ...options,
    }),
  }
}

export const useAvailabilityCheckMutation = () =>
  useMutation({ mutationFn: RentalService.checkAvailability })
