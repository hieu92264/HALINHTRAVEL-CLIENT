import type { PayrollSourceReport, ProfitReport, ReportFilters, RunReport } from '@/modules/reports/reports.types'
import { httpService } from '@/services/http.service'

const reportUrl = '/other/reports'

export class OperationalReportService {
  static workerVehicles(params: ReportFilters) { return httpService.get<RunReport>(`${reportUrl}/worker-vehicles`, { params }) }
  static touristVehicles(params: ReportFilters) { return httpService.get<RunReport>(`${reportUrl}/tourist-vehicles`, { params }) }
  static profit(params: ReportFilters) { return httpService.get<ProfitReport>(`${reportUrl}/profit`, { params }) }
  static payrollSources(params: ReportFilters) { return httpService.get<PayrollSourceReport>(`${reportUrl}/payroll-sources`, { params }) }
}
