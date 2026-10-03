import type { CreateCustomerDto } from '@/modules/master-data/customer/schemas/create-customer.schema'
import type { UpdateCustomerDto } from '@/modules/master-data/customer/schemas/update-customer.schema'
import type { Customer } from '@/modules/master-data/master-data.type'
import { httpService } from '@/services/http.service'

export const CustomerURL = '/master-data/customers'

export class CustomerService {
  public static async getCustomerList(): Promise<Customer[]> {
    const response = await httpService.get<Customer[]>(CustomerURL)
    console.log('response', response)
    return response
  }

  public static async storeCustomer(payload: CreateCustomerDto): Promise<Customer> {
    const response = await httpService.post<Customer, CreateCustomerDto>(CustomerURL, payload)
    console.log('response', response)
    return response
  }

  public static async updateCustomer(id: number, payload: UpdateCustomerDto): Promise<Customer> {
    const response = await httpService.patch<Customer, UpdateCustomerDto>(
      CustomerURL + `/${id}`,
      payload,
    )
    console.log('response', response)
    return response
  }

  public static async deactiveCustomer(id: number): Promise<void> {
    const response = await httpService.delete<void>(CustomerURL + `/${id}`)
    console.log('response', response)
    return response
  }
}
