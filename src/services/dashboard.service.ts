import type { DashboardOverview } from '@/modules/dashboard/dashboard.types'
import { httpService } from '@/services/http.service'

export const DashboardService = {
  getOverview(date: string): Promise<DashboardOverview> {
    return httpService.get('/dashboard/overview', { params: { date } })
  },
}
