import type { ReportFilters, ReportResponse } from '@/modules/reports/reports.types'
import { httpService } from '@/services/http.service'

const baseUrl = '/other/reports'

export const ReportService = {
  get(slug: string, filters: ReportFilters): Promise<ReportResponse> {
    return httpService.get<ReportResponse>(`${baseUrl}/${slug}`, { params: filters })
  },
  download(slug: string, filters: ReportFilters) {
    return httpService.download(`${baseUrl}/${slug}`, { params: { ...filters, format: 'docx' } })
  },
}
