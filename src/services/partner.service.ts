import type { Partner } from '@/modules/master-data/master-data.type'
import type { CreatePartnerDto } from '@/modules/master-data/partner/schemas/create-partner.schema'
import type { UpdatePartnerDto } from '@/modules/master-data/partner/schemas/update-partner.schema'
import { httpService } from '@/services/http.service'

export const PartnerURL = '/master-data/partners'

export class PartnerService {
  public static async getPartnerList(): Promise<Partner[]> {
    const response = await httpService.get<Partner[]>(PartnerURL)
    console.log('response', response)
    return response
  }

  public static async storePartner(payload: CreatePartnerDto): Promise<Partner> {
    const response = await httpService.post<Partner, CreatePartnerDto>(PartnerURL, payload)
    console.log('response', response)
    return response
  }

  public static async updatePartner(id: number, payload: UpdatePartnerDto): Promise<Partner> {
    const response = await httpService.patch<Partner, UpdatePartnerDto>(
      PartnerURL + `/${id}`,
      payload,
    )
    console.log('response', response)
    return response
  }

  public static async deactivePartner(id: number): Promise<void> {
    const response = await httpService.delete<void>(PartnerURL + `/${id}`)
    console.log('response', response)
    return response
  }

  public static async getPartnerOptions(): Promise<{ id: number; name: string }[]> {
    const response = await httpService.get<{ id: number; name: string }[]>(PartnerURL + '/options')
    console.log('response', response)
    return response
  }
}
