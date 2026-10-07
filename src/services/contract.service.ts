import type {
  Contract,
  ContractFromQuotationPayload,
  ContractPayload,
  ContractScheduleRule,
  GenerateTripSchedulesResult,
  ScheduleDay,
  ScheduleRulePayload,
} from '@/modules/contract/contract.types'
import { httpService } from '@/services/http.service'

const contractUrl = '/contract'
export class ContractService {
  static getContracts(): Promise<Contract[]> {
    return httpService.get(`${contractUrl}/contracts`)
  }
  static getContract(id: number): Promise<Contract> {
    return httpService.get(`${contractUrl}/contracts/${id}`)
  }
  static createContract(payload: ContractPayload): Promise<Contract> {
    return httpService.post(`${contractUrl}/contracts`, payload)
  }
  static createFromQuotation(payload: ContractFromQuotationPayload): Promise<Contract> {
    return httpService.post(`${contractUrl}/contracts/from-quotation`, payload)
  }
  static updateContract(id: number, payload: Partial<ContractPayload>): Promise<Contract> {
    return httpService.patch(`${contractUrl}/contracts/${id}`, payload)
  }
  static deleteContract(id: number): Promise<void> {
    return httpService.delete(`${contractUrl}/contracts/${id}`)
  }
  static activateContract(id: number): Promise<Contract> {
    return httpService.post(`${contractUrl}/contracts/${id}/activate`)
  }
  static completeContract(id: number): Promise<Contract> {
    return httpService.post(`${contractUrl}/contracts/${id}/complete`)
  }
  static cancelContract(id: number): Promise<Contract> {
    return httpService.post(`${contractUrl}/contracts/${id}/cancel`)
  }
  static getScheduleRules(contractId: number): Promise<ContractScheduleRule[]> {
    return httpService.get(`${contractUrl}/contracts/${contractId}/schedule-rules`)
  }
  static createScheduleRule(
    contractId: number,
    payload: ScheduleRulePayload,
  ): Promise<ContractScheduleRule> {
    return httpService.post(`${contractUrl}/contracts/${contractId}/schedule-rules`, payload)
  }
  static updateScheduleRule(
    id: number,
    payload: Partial<ScheduleRulePayload>,
  ): Promise<ContractScheduleRule> {
    return httpService.patch(`${contractUrl}/schedule-rules/${id}`, payload)
  }
  static deleteScheduleRule(id: number): Promise<void> {
    return httpService.delete(`${contractUrl}/schedule-rules/${id}`)
  }
  static replaceScheduleDays(id: number, days: ScheduleDay[]): Promise<ContractScheduleRule> {
    return httpService.put(`${contractUrl}/schedule-rules/${id}/days`, { days })
  }
  static generateTripSchedules(
    id: number,
    payload: { from_date: string; to_date: string },
  ): Promise<GenerateTripSchedulesResult> {
    return httpService.post(`${contractUrl}/schedule-rules/${id}/generate-trip-schedules`, payload)
  }
}
