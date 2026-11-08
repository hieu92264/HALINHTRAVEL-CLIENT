import type { ReportFilters, ReportResponse } from '@/modules/reports/reports.types'
import { httpService } from '@/services/http.service'

const baseUrl = '/other/reports'
const reportParams = (filters: ReportFilters) =>
  Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined))

export const ReportService = {
  get(slug: string, filters: ReportFilters): Promise<ReportResponse> {
    return httpService.get<ReportResponse>(`${baseUrl}/${slug}`, { params: reportParams(filters) })
  },
  download(slug: string, filters: ReportFilters) {
    return httpService.downloadPdf(`${baseUrl}/${slug}`, { params: { ...reportParams(filters), format: 'pdf' } })
  },
  downloadExcel(slug: string, filters: ReportFilters) {
    return httpService.downloadExcel(`${baseUrl}/${slug}`, { params: { ...reportParams(filters), format: 'xlsx' } })
  },
}
