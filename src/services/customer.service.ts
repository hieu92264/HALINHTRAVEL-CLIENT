import type { Customer } from '@/modules/master-data/master-data.type'
import { httpService } from '@/services/http.service'

export const CustomerURL = {
  getList: '/master-data/customers',
}

export class CustomerService {
  public static async getCustomerList(): Promise<Customer[]> {
    const response = await httpService.get<Customer[]>(CustomerURL.getList)
    console.log('response', response)
    return response
  }
}
