import type { ExpenseType } from '@/modules/master-data/master-data.type'
import type { CreateExpenseTypeDto } from '@/modules/master-data/expense-type/schemas/create-expense-type.schema'
import type { UpdateExpenseTypeDto } from '@/modules/master-data/expense-type/schemas/update-expense-type.schema'
import { httpService } from '@/services/http.service'

export const ExpenseTypeURL = '/master-data/expense-types'

export class ExpenseTypeService {
  public static async getExpenseTypeList(): Promise<ExpenseType[]> {
    const response = await httpService.get<ExpenseType[]>(ExpenseTypeURL)
    console.log('response', response)
    return response
  }

  public static async storeExpenseType(payload: CreateExpenseTypeDto): Promise<ExpenseType> {
    const response = await httpService.post<ExpenseType, CreateExpenseTypeDto>(
      ExpenseTypeURL,
      payload,
    )
    console.log('response', response)
    return response
  }

  public static async updateExpenseType(
    id: number,
    payload: UpdateExpenseTypeDto,
  ): Promise<ExpenseType> {
    const response = await httpService.patch<ExpenseType, UpdateExpenseTypeDto>(
      ExpenseTypeURL + `/${id}`,
      payload,
    )
    console.log('response', response)
    return response
  }

  public static async deactiveExpenseType(id: number): Promise<void> {
    const response = await httpService.delete<void>(ExpenseTypeURL + `/${id}`)
    console.log('response', response)
    return response
  }
}
