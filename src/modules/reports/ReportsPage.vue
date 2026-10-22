<script setup lang="ts">
import type { ReportExportFormat, ReportFilters, ReportKind } from './report.types'
import { getDetailFilters, getReportDetailConfig, type ReportRow } from './report-detail.config'
import { ReportService } from '@/services/report.service'
import { useAuthStore } from '@/modules/auth/auth.store'
import { DataGrid, type DataGridColumnDef, type DataGridDataSource } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { computed, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { CircleAlert, Download, LoaderCircle, RefreshCw } from '@lucide/vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { formatDate, formatMoney } from '@/modules/finance/finance.format'
import { createReportColumn, createReportTotals, formatReportValue } from './report.presentation'

const props = defineProps<{ kind: ReportKind }>()
const auth = useAuthStore()
const route = useRoute()
const now = new Date()
const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
const filters = ref<ReportFilters>({ from_date: first, to_date: last, basis: 'accrual' })
const financeTab = ref('cashflow')
const expandedRowId = ref<string | null>(null)

const detailConfig = computed(() => getReportDetailConfig(props.kind))
const exportFormat = computed<ReportExportFormat>(() =>
  [
    'fixed-trips',
    'tourism-trips',
    'customer-debts',
    'customer-debt-details',
    'partner-debts',
    'partner-debt-details',
    'driver-payroll',
    'driver-payroll-details',
    'vehicle-profit',
  ].includes(props.kind)
    ? 'docx'
    : 'xlsx',
)
const exportLabel = computed(() => (exportFormat.value === 'docx' ? 'Xuất Word' : 'Xuất Excel'))
const title = computed(
  () =>
    ({
      'fixed-trips': 'Báo cáo xe chạy công nhân',
      'tourism-trips': 'Báo cáo xe chạy du lịch',
      finance: 'Thu chi, chi phí và công nợ',
      'customer-debts': 'Công nợ khách hàng',
      'customer-debt-details': 'Chi tiết công nợ khách hàng',
      'partner-debts': 'Công nợ chủ xe',
      'partner-debt-details': 'Chi tiết công nợ chủ xe',
      'driver-payroll': 'Bảng lương lái xe',
      'driver-payroll-details': 'Chi tiết lương lái xe',
      'vehicle-profit': 'Báo cáo lợi nhuận xe',
      'profit-loss': 'Báo cáo lợi nhuận',
    })[props.kind],
)
const slug = computed(() => (props.kind === 'finance' ? financeTab.value : props.kind))
const query = useQuery({
  queryKey: computed(() => ['reports', slug.value, filters.value]),
  queryFn: () => ReportService.get(slug.value, filters.value),
})
const summaryRows = computed<ReportRow[]>(() => query.data.value?.rows ?? [])

function getSummaryRowId(row: ReportRow, index: number): string {
  const config = detailConfig.value
  return String(row.id ?? (config ? row[config.filterKey] : undefined) ?? index)
}

const selectedSummaryRow = computed(() => {
  if (!expandedRowId.value) return undefined
  return summaryRows.value.find((row, index) => getSummaryRowId(row, index) === expandedRowId.value)
})
const detailRequest = computed(() => {
  const config = detailConfig.value
  const row = selectedSummaryRow.value
  if (!config || !row) return undefined

  const detailFilters = getDetailFilters(filters.value, config, row)
  return detailFilters ? { config, filters: detailFilters } : undefined
})
const detailQuery = useQuery({
  queryKey: computed(() => {
    const request = detailRequest.value
    return request
      ? ['report-row-detail', request.config.detailKind, request.filters]
      : ['report-row-detail', 'idle']
  }),
  queryFn: () => {
    const request = detailRequest.value
    if (!request) throw new Error('Không xác định được dòng cần xem chi tiết.')
    return ReportService.get(request.config.detailKind, request.filters)
  },
  enabled: computed(() => Boolean(detailRequest.value)),
})

const customerDebtDetailColumns: DataGridColumnDef<ReportRow>[] = [
  { accessorKey: 'stt', header: 'STT', meta: { label: 'STT' } },
  { accessorKey: 'date', header: 'Ngày', meta: { label: 'Ngày' }, cell: ({ getValue }) => formatDate(String(getValue() ?? '')) },
  {
    id: 'description',
    header: 'Diễn giải/Hành trình',
    meta: { label: 'Diễn giải/Hành trình' },
    cell: ({ row }) =>
      [formatReportValue('type', row.original.type), row.original.journey]
        .filter((value) => value !== '—')
        .join(' ') || '—',
  },
  { accessorKey: 'vehicle_plate', header: 'Biển số', meta: { label: 'Biển số' } },
  { accessorKey: 'pickup_time', header: 'Giờ đón', meta: { label: 'Giờ đón' } },
  { accessorKey: 'return_time', header: 'Giờ về', meta: { label: 'Giờ về' } },
  { accessorKey: 'note', header: 'Ghi chú', meta: { label: 'Ghi chú' } },
  { accessorKey: 'debit', header: 'Nợ phát sinh', meta: { label: 'Nợ phát sinh' }, cell: ({ getValue }) => formatMoney(Number(getValue() ?? 0)) },
  { accessorKey: 'credit', header: 'Có phát sinh', meta: { label: 'Có phát sinh' }, cell: ({ getValue }) => formatMoney(Number(getValue() ?? 0)) },
  { accessorKey: 'balance', header: 'Nợ cuối kỳ', meta: { label: 'Nợ cuối kỳ' }, cell: ({ getValue }) => formatMoney(Number(getValue() ?? 0)) },
]

function createDynamicColumns(rows: ReportRow[]): DataGridColumnDef<ReportRow>[] {
  return Object.keys(rows[0] ?? {})
    .filter((key) => !['id', 'schedule_id', 'details', 'expense_breakdown'].includes(key))
    .map(createReportColumn)
}

const columns = computed(() => createDynamicColumns(summaryRows.value))
const detailColumns = computed<DataGridColumnDef<ReportRow>[]>(() => {
  if (detailRequest.value?.config.detailKind === 'customer-debt-details') return customerDebtDetailColumns
  return createDynamicColumns(detailQuery.data.value?.rows ?? [])
})
const source = computed<DataGridDataSource<ReportRow>>(() => ({
  data: summaryRows.value,
  isLoading: query.isLoading.value,
  isFetching: query.isFetching.value,
  error: query.error.value,
}))
const detailSource = computed<DataGridDataSource<ReportRow>>(() => ({
  data: detailQuery.data.value?.rows ?? [],
  isLoading: detailQuery.isLoading.value,
  isFetching: detailQuery.isFetching.value,
  error: detailQuery.error.value,
}))
const totals = computed(() => createReportTotals(query.data.value?.totals ?? {}))
const detailTotals = computed(() => createReportTotals(detailQuery.data.value?.totals ?? {}))

const can = (permission: string) => auth.user?.permissions.includes(permission) ?? false
type FinanceTab = [string, string]
const financeTabs = computed<FinanceTab[]>(() => {
  const tabs: Array<FinanceTab | null> = [
    can('receipts.view') && can('expenses.view') && can('partner-payments.view') && can('driver-advances.view')
      ? ['cashflow', 'Thu chi']
      : null,
    can('expenses.view') ? ['expenses', 'Chi phí'] : null,
    can('receipts.view') ? ['customer-debts', 'Công nợ khách'] : null,
    can('partner-payments.view') ? ['partner-debts', 'Công nợ đối tác'] : null,
  ]
  return tabs.filter((tab): tab is FinanceTab => tab !== null)
})
watch(
  financeTabs,
  (tabs) => {
    const firstTab = tabs[0]
    if (props.kind === 'finance' && firstTab && !tabs.some(([value]) => value === financeTab.value))
      financeTab.value = firstTab[0]
  },
  { immediate: true },
)
watch(filters, () => (expandedRowId.value = null), { deep: true })
watch(
  [summaryRows, detailConfig, () => route.query],
  () => {
    const config = detailConfig.value
    const requestedId = config && route.query[config.filterKey]
    if (!config || expandedRowId.value || typeof requestedId !== 'string') return
    const index = summaryRows.value.findIndex((row) => String(row[config.filterKey]) === requestedId)
    const row = index >= 0 ? summaryRows.value[index] : undefined
    if (row) expandedRowId.value = getSummaryRowId(row, index)
  },
  { immediate: true },
)

function reset() {
  filters.value = { from_date: first, to_date: last, basis: 'accrual' }
}

async function downloadReport(
  reportSlug: string,
  reportFilters: ReportFilters,
  format: ReportExportFormat,
  errorMessage: string,
) {
  try {
    const file = await ReportService.download(reportSlug, reportFilters, format)
    const url = URL.createObjectURL(file.blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.filename
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    toast.error(error instanceof Error ? error.message : errorMessage)
  }
}

function download() {
  return downloadReport(slug.value, filters.value, exportFormat.value, `Không thể xuất ${exportLabel.value}.`)
}

function downloadDetail() {
  const request = detailRequest.value
  if (!request) return
  return downloadReport(
    request.config.detailKind,
    request.filters,
    'docx',
    `Không thể ${request.config.exportLabel.toLocaleLowerCase('vi-VN')}.`,
  )
}
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">{{ title }}</h1>
        <p class="mt-1 text-sm text-muted-foreground">Đối soát dữ liệu vận hành và tài chính theo kỳ.</p>
      </div>
      <Button :disabled="query.isFetching.value" @click="download"><Download class="size-4" />{{ exportLabel }}</Button>
    </header>

    <Tabs v-if="kind === 'finance'" v-model="financeTab">
      <TabsList><TabsTrigger v-for="tab in financeTabs" :key="tab[0]" :value="tab[0]">{{ tab[1] }}</TabsTrigger></TabsList>
      <TabsContent :value="financeTab" />
    </Tabs>

    <div class="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
      <label class="grid gap-1 text-sm">Từ ngày<Input v-model="filters.from_date" type="date" /></label>
      <label class="grid gap-1 text-sm">Đến ngày<Input v-model="filters.to_date" type="date" /></label>
      <label v-if="kind === 'profit-loss'" class="grid gap-1 text-sm">Cơ sở<select v-model="filters.basis" class="h-9 rounded-md border bg-background px-3"><option value="accrual">Dồn tích</option><option value="cash">Tiền mặt</option></select></label>
      <Button variant="outline" @click="reset">Đặt lại</Button>
      <Button variant="outline" @click="query.refetch()"><RefreshCw class="size-4" />Cập nhật</Button>
    </div>

    <div v-if="totals.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <article v-for="total in totals" :key="total.key" class="rounded-lg border bg-card p-4">
        <p class="text-xs text-muted-foreground">{{ total.label }}</p>
        <p class="mt-1 text-lg font-semibold tabular-nums">{{ total.value }}</p>
      </article>
    </div>

    <DataGrid
      v-model:expanded-row-id="expandedRowId"
      :data-source="source"
      :columns="columns"
      :pagination="{ mode: 'client', pageSize: 25, pageSizeOptions: [25, 50, 100] }"
      filter-row
      global-filter
      :get-row-id="getSummaryRowId"
      :persist="{ key: `report-${slug}`, url: true, queryPrefix: 'report' }"
      empty-title="Không có dữ liệu trong kỳ"
      empty-description="Thử điều chỉnh khoảng thời gian hoặc bộ lọc."
      @retry="query.refetch()"
    >
      <template v-if="detailConfig" #row-detail>
        <section class="space-y-4 p-4 sm:p-5" aria-live="polite">
          <header class="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h2 class="text-base font-semibold text-foreground">{{ detailConfig.label }}</h2>
              <p class="mt-0.5 text-sm text-muted-foreground">Đối chiếu các khoản phát sinh của dòng đang chọn.</p>
            </div>
            <Button size="sm" variant="outline" :disabled="!detailRequest || detailQuery.isFetching.value" @click="downloadDetail"><Download class="size-4" />{{ detailConfig.exportLabel }}</Button>
          </header>

          <div v-if="!detailRequest" class="flex items-start gap-3 rounded-md border border-destructive/25 bg-destructive/5 p-3 text-sm">
            <CircleAlert class="mt-0.5 size-4 shrink-0 text-destructive" />
            <p>Không tìm thấy mã định danh để tải chi tiết cho dòng này.</p>
          </div>
          <template v-else>
            <div v-if="detailQuery.isLoading.value" class="flex items-center gap-2 py-2 text-sm text-muted-foreground"><LoaderCircle class="size-4 animate-spin text-primary" />Đang tải chi tiết…</div>
            <div v-else-if="detailQuery.error.value" class="flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/25 bg-destructive/5 p-3 text-sm">
              <span class="flex items-center gap-2"><CircleAlert class="size-4 text-destructive" />Không thể tải chi tiết.</span>
              <Button size="sm" variant="outline" @click="detailQuery.refetch()">Thử lại</Button>
            </div>
            <template v-else>
              <div v-if="detailTotals.length" class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div v-for="total in detailTotals" :key="total.key" class="rounded-md border border-border bg-muted/35 px-3 py-2">
                  <p class="text-xs text-muted-foreground">{{ total.label }}</p>
                  <p class="mt-0.5 text-sm font-semibold tabular-nums">{{ total.value }}</p>
                </div>
              </div>
              <DataGrid
                :data-source="detailSource"
                :columns="detailColumns"
                :pagination="{ mode: 'client', pageSize: 10, pageSizeOptions: [10, 25, 50] }"
                :get-row-id="(row, index) => String(row.id ?? index)"
                empty-title="Không có chi tiết trong kỳ"
                empty-description="Dòng tổng hợp này chưa có khoản phát sinh phù hợp."
                @retry="detailQuery.refetch()"
              />
            </template>
          </template>
        </section>
      </template>
    </DataGrid>
  </section>
</template>
