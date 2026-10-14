import type { ReportFilters, ReportResponse } from '@/modules/reports/report.types'
import { httpService } from '@/services/http.service'

const baseUrl = '/other/reports'

export const ReportService = {
  get(slug: string, filters: ReportFilters): Promise<ReportResponse> {
    return httpService.get(`${baseUrl}/${slug}`, { params: filters })
  },
  download(slug: string, filters: ReportFilters) {
    return httpService.download(`${baseUrl}/${slug}`, { params: { ...filters, format: 'xlsx' } })
  },
}
