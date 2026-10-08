import { rentalQueryKeys } from '@/modules/rental/rental.composables'
import { ContractService } from '@/services/contract.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'

export const contractQueryKeys = {
  all: ['contracts'] as const,
  detail: (id: number) => ['contracts', id] as const,
  scheduleRules: (contractId: number) => ['contracts', contractId, 'schedule-rules'] as const,
}

const invalidateContracts = async (
  client: ReturnType<typeof useQueryClient>,
  contractId?: number,
) => {
  await client.invalidateQueries({ queryKey: contractQueryKeys.all })
  if (contractId) await client.invalidateQueries({ queryKey: contractQueryKeys.detail(contractId) })
}

export const useContractsQuery = () =>
  useQuery({ queryKey: contractQueryKeys.all, queryFn: ContractService.getContracts })
export const useContractQuery = (id: () => number) =>
  useQuery({
    queryKey: computed(() => contractQueryKeys.detail(id())),
    queryFn: () => ContractService.getContract(id()),
    enabled: () => Number.isInteger(id()) && id() > 0,
  })
export const useScheduleRulesQuery = (contractId: () => number) =>
  useQuery({
    queryKey: computed(() => contractQueryKeys.scheduleRules(contractId())),
    queryFn: () => ContractService.getScheduleRules(contractId()),
    enabled: () => Number.isInteger(contractId()) && contractId() > 0,
  })

export const useContractMutations = () => {
  const client = useQueryClient()
  const standard = { onSuccess: () => invalidateContracts(client) }
  const fromQuotation = {
    onSuccess: async () => {
      await Promise.all([
        invalidateContracts(client),
        client.invalidateQueries({ queryKey: rentalQueryKeys.requests }),
        client.invalidateQueries({ queryKey: rentalQueryKeys.quotations }),
      ])
    },
  }

  return {
    create: useMutation({ mutationFn: ContractService.createContract, ...standard }),
    createFromQuotation: useMutation({
      mutationFn: ContractService.createFromQuotation,
      ...fromQuotation,
    }),
    update: useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number
        data: Parameters<typeof ContractService.updateContract>[1]
      }) => ContractService.updateContract(id, data),
      ...standard,
    }),
    remove: useMutation({ mutationFn: ContractService.deleteContract, ...standard }),
    activate: useMutation({ mutationFn: ContractService.activateContract, ...standard }),
    complete: useMutation({ mutationFn: ContractService.completeContract, ...standard }),
    cancel: useMutation({ mutationFn: ContractService.cancelContract, ...standard }),
    createScheduleRule: useMutation({
      mutationFn: ({
        contractId,
        data,
      }: {
        contractId: number
        data: Parameters<typeof ContractService.createScheduleRule>[1]
      }) => ContractService.createScheduleRule(contractId, data),
      onSuccess: async (_, variables) => {
        await client.invalidateQueries({
          queryKey: contractQueryKeys.scheduleRules(variables.contractId),
        })
      },
    }),
    updateScheduleRule: useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number
        data: Parameters<typeof ContractService.updateScheduleRule>[1]
      }) => ContractService.updateScheduleRule(id, data),
      onSuccess: () => client.invalidateQueries({ queryKey: ['contracts'] }),
    }),
    removeScheduleRule: useMutation({
      mutationFn: ContractService.deleteScheduleRule,
      onSuccess: () => client.invalidateQueries({ queryKey: ['contracts'] }),
    }),
    replaceScheduleDays: useMutation({
      mutationFn: ({
        id,
        days,
      }: {
        id: number
        days: Parameters<typeof ContractService.replaceScheduleDays>[1]
      }) => ContractService.replaceScheduleDays(id, days),
      onSuccess: () => client.invalidateQueries({ queryKey: ['contracts'] }),
    }),
    generateTripSchedules: useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number
        data: Parameters<typeof ContractService.generateTripSchedules>[1]
      }) => ContractService.generateTripSchedules(id, data),
      onSuccess: () => client.invalidateQueries({ queryKey: ['contracts'] }),
    }),
  }
}
