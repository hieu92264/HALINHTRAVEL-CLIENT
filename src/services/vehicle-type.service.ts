import type { VehicleType } from '@/modules/master-data/master-data.type'
import { httpService } from '@/services/http.service'

const url = '/master-data/vehicle-types'

export const VehicleTypeService = {
  getList: () => httpService.get<VehicleType[]>(url),
  update: (id: number, payload: Pick<VehicleType, 'name' | 'tourism_wage_rate' | 'is_active'>) =>
    httpService.patch<VehicleType, Pick<VehicleType, 'name' | 'tourism_wage_rate' | 'is_active'>>(`${url}/${id}`, payload),
}
