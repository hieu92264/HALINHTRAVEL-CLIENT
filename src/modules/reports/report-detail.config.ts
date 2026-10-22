import type { ReportFilters, ReportKind } from './report.types'

export type ReportRow = Record<string, unknown>

export type ReportDetailConfig = {
  detailKind: Extract<
    ReportKind,
    'customer-debt-details' | 'partner-debt-details' | 'driver-payroll-details'
  >
  filterKey: Extract<keyof ReportFilters, 'customer_id' | 'partner_id' | 'payroll_id'>
  label: string
  exportLabel: string
}

export const reportDetailConfigs: Partial<Record<ReportKind, ReportDetailConfig>> = {
  'customer-debts': {
    detailKind: 'customer-debt-details',
    filterKey: 'customer_id',
    label: 'Chi tiết công nợ khách hàng',
    exportLabel: 'Xuất chi tiết công nợ',
  },
  'partner-debts': {
    detailKind: 'partner-debt-details',
    filterKey: 'partner_id',
    label: 'Chi tiết công nợ chủ xe',
    exportLabel: 'Xuất chi tiết công nợ',
  },
  'driver-payroll': {
    detailKind: 'driver-payroll-details',
    filterKey: 'payroll_id',
    label: 'Chi tiết lương lái xe',
    exportLabel: 'Xuất chi tiết lương',
  },
}

export function getReportDetailConfig(kind: ReportKind): ReportDetailConfig | undefined {
  return reportDetailConfigs[kind]
}

export function getDetailFilters(
  filters: ReportFilters,
  config: ReportDetailConfig,
  row: ReportRow,
): ReportFilters | undefined {
  const id = row[config.filterKey]

  if (id === null || id === undefined || id === '') return undefined

  return {
    ...filters,
    [config.filterKey]: String(id),
  }
}
