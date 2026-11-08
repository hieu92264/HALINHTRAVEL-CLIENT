<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
      <div>
        <p class="text-sm font-medium text-primary">Báo cáo</p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight">{{ definition.title }}</h1>
        <p class="mt-1 text-sm text-muted-foreground">{{ definition.description }}</p>
      </div>
      <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
        <label class="grid gap-1 text-xs font-medium text-muted-foreground"
          >Từ ngày<Input v-model="filters.from_date" type="date" class="h-9 min-w-40"
        /></label>
        <label class="grid gap-1 text-xs font-medium text-muted-foreground"
          >Đến ngày<Input v-model="filters.to_date" type="date" class="h-9 min-w-40"
        /></label>
        <template v-if="isTripReport">
          <label v-if="isTourismTrips" class="grid gap-1 text-xs font-medium text-muted-foreground"
            >Theo lái xe<select
              v-model="filters.driver_id"
              class="h-9 min-w-40 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">Tất cả</option>
              <option
                v-for="driver in driversQuery.data.value ?? []"
                :key="driver.id"
                :value="String(driver.id)"
              >
                {{ driver.full_name }}
              </option>
            </select>
          </label>
          <label class="grid gap-1 text-xs font-medium text-muted-foreground"
            >Theo xe<select
              v-model="filters.vehicle_id"
              class="h-9 min-w-36 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">Tất cả</option>
              <option
                v-for="vehicle in vehiclesQuery.data.value ?? []"
                :key="vehicle.id"
                :value="String(vehicle.id)"
              >
                {{ vehicle.license_plate }}
              </option>
            </select>
          </label>
          <label class="grid gap-1 text-xs font-medium text-muted-foreground"
            >Theo khách hàng<select
              v-model="filters.customer_id"
              class="h-9 min-w-40 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">Tất cả</option>
              <option
                v-for="customer in customersQuery.data.value ?? []"
                :key="customer.id"
                :value="String(customer.id)"
              >
                {{ customer.name }}
              </option>
            </select>
          </label>
        </template>
        <template v-if="isBusinessTrips">
          <label class="grid gap-1 text-xs font-medium text-muted-foreground"
            >Theo tuyến<select
              v-model="filters.route_id"
              class="h-9 min-w-40 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">Tất cả</option>
              <option
                v-for="route in routesQuery.data.value ?? []"
                :key="route.id"
                :value="String(route.id)"
              >
                {{ route.name }}
              </option>
            </select>
          </label>
        </template>
        <Button variant="outline" :disabled="query.isFetching.value" @click="query.refetch()"
          ><RefreshCw class="size-4" />Cập nhật</Button
        >
        <Button :disabled="query.isFetching.value" @click="download(definition.slug)"
          ><Download class="size-4" />Xuất PDF</Button
        >
      </div>
    </header>

    <div v-if="query.data.value" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article v-for="item in totals" :key="item.key" class="rounded-xl border bg-card p-4">
        <p class="text-xs font-medium text-muted-foreground">{{ item.label }}</p>
        <p class="mt-1 text-xl font-semibold tabular-nums">{{ money(item.value) }}</p>
      </article>
    </div>

    <DataGrid
      v-if="hasInlineDetails"
      v-model:expanded-row-id="expandedDebtRowId"
      :data-source="source"
      :columns="columns"
      :pagination="pagination"
      filter-row
      global-filter
      mobile-mode="cards"
      :get-row-id="rowId"
      :persist="{ key: `report-${kind}`, url: true }"
      empty-title="Không có dữ liệu báo cáo"
      empty-description="Thử thay đổi khoảng thời gian hoặc kiểm tra dữ liệu vận hành đã hoàn tất."
      @update:expanded-row-id="selectExpandedDebtRow"
      @filters-change="clearDetail"
      @global-filter-change="clearDetail"
      @retry="query.refetch()"
    >
      <template #row-detail="{ row }">
        <section class="overflow-hidden rounded-lg border border-border bg-card">
          <header
            class="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/35 px-4 py-3"
          >
            <div>
              <h2 class="text-sm font-semibold text-foreground">{{ definition.detail?.label }}</h2>
              <p class="mt-0.5 text-sm text-muted-foreground">
                {{ detailSubjectLabel(row) }} trong khoảng thời gian đã chọn.
              </p>
            </div>
            <Button
              size="sm"
              :disabled="detailQuery.isFetching.value || !selected"
              @click="download(definition.detail!.slug, true)"
            >
              <Download class="size-4" />Xuất PDF chi tiết
            </Button>
          </header>
          <DataGrid
            class="rounded-none border-x-0 border-b-0"
            :data-source="detailSource"
            :columns="detailColumns"
            :pagination="pagination"
            filter-row
            global-filter
            mobile-mode="cards"
            :get-row-id="detailRowId"
            empty-title="Chưa có phát sinh công nợ"
            empty-description="Không có chứng từ phù hợp với đối tượng và khoảng thời gian này."
            @retry="detailQuery.refetch()"
          />
        </section>
      </template>
    </DataGrid>

    <DataGrid
      v-else
      :data-source="source"
      :columns="columns"
      :pagination="pagination"
      filter-row
      global-filter
      mobile-mode="cards"
      :get-row-id="rowId"
      :persist="{ key: `report-${kind}`, url: true }"
      empty-title="Không có dữ liệu báo cáo"
      empty-description="Thử thay đổi khoảng thời gian hoặc kiểm tra dữ liệu vận hành đã hoàn tất."
      @filters-change="clearDetail"
      @global-filter-change="clearDetail"
      @retry="query.refetch()"
    />

    <section v-if="definition.detail && !hasInlineDetails" class="rounded-xl border bg-card">
      <header class="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 class="font-semibold">{{ definition.detail.label }}</h2>
          <p class="text-sm text-muted-foreground">
            Chọn một dòng ở bảng tổng hợp để xem phát sinh và xuất PDF chi tiết.
          </p>
        </div>
        <Button
          v-if="selected"
          size="sm"
          :disabled="detailQuery.isFetching.value"
          @click="download(definition.detail.slug, true)"
          ><Download class="size-4" />Xuất PDF chi tiết</Button
        >
      </header>
      <DataGrid
        :data-source="detailSource"
        :columns="detailColumns"
        :pagination="pagination"
        filter-row
        global-filter
        mobile-mode="cards"
        :get-row-id="
          (row) =>
            String(
              row.stt ??
                row.document_no ??
                row.worker_run_no ??
                row.tourist_run_no ??
                JSON.stringify(row),
            )
        "
        empty-title="Chưa chọn dòng báo cáo"
        empty-description="Chọn “Xem chi tiết” ở bảng phía trên."
        @retry="detailQuery.refetch()"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, h, reactive, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { Download, Eye, RefreshCw } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  DataGrid,
  type DataGridColumnDef,
  type DataGridDataSource,
} from '@/shared/components/data-grid'
import { ReportService } from '@/services/report.service'
import { downloadFile } from '@/shared/lib/download-file'
import { CustomerService } from '@/services/customer.service'
import { DriverService } from '@/services/driver.service'
import { PartnerService } from '@/services/partner.service'
import { RouteService } from '@/services/route.service'
import { VehicleService } from '@/services/vehicle.service'
import { formatDate, formatMoney } from '@/modules/finance/finance.format'
import type { ReportFilters, ReportKind, ReportRow } from './reports.types'

const props = defineProps<{ kind: ReportKind }>()
const today = new Date()
const filters = reactive<ReportFilters>({
  from_date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`,
  to_date: today.toISOString().slice(0, 10),
})
const selected = ref<ReportRow | null>(null)
const expandedDebtRowId = ref<string | null>(null)
const definitions: Record<
  ReportKind,
  {
    title: string
    description: string
    slug: string
    detail?: { slug: string; key: 'customer_id' | 'partner_id' | 'payroll_id'; label: string }
  }
> = {
  'business-trips': {
    title: 'Báo cáo xe chạy công nhân',
    description: 'Các chuyến công nhân hoàn tất theo kỳ.',
    slug: 'business-trips',
  },
  'tourism-trips': {
    title: 'Báo cáo xe chạy du lịch',
    description: 'Các chuyến du lịch hoàn tất và đối soát thu tiền.',
    slug: 'tourism-trips',
  },
  'customer-debts': {
    title: 'Công nợ khách hàng',
    description: 'Doanh thu chuyến hoàn tất trừ phiếu thu khách hàng.',
    slug: 'customer-debt-summary',
    detail: {
      slug: 'customer-debt-details',
      key: 'customer_id',
      label: 'Chi tiết công nợ khách hàng',
    },
  },
  'partner-debts': {
    title: 'Công nợ chủ xe',
    description: 'Chi phí thuê xe ngoài trừ chứng từ đã chi trả.',
    slug: 'partner-debt-summary',
    detail: { slug: 'partner-debt-details', key: 'partner_id', label: 'Chi tiết công nợ chủ xe' },
  },
  'driver-payroll': {
    title: 'Bảng lương lái xe',
    description: 'Kỳ lương từ chấm công xe công nhân và xe du lịch.',
    slug: 'driver-payroll',
    detail: { slug: 'driver-payroll-details', key: 'payroll_id', label: 'Chi tiết lương lái xe' },
  },
  'vehicle-profit': {
    title: 'Lợi nhuận xe',
    description: 'Doanh thu và chi phí theo biển số xe trong kỳ.',
    slug: 'vehicle-profit',
  },
}
const definition = computed(() => definitions[props.kind])
const isBusinessTrips = computed(() => props.kind === 'business-trips')
const isTourismTrips = computed(() => props.kind === 'tourism-trips')
const isTripReport = computed(() => isBusinessTrips.value || isTourismTrips.value)
const hasInlineDetails = computed(
  () =>
    props.kind === 'customer-debts' ||
    props.kind === 'partner-debts' ||
    props.kind === 'driver-payroll',
)
const query = useQuery({
  queryKey: computed(() => ['restored-report', definition.value.slug, { ...filters }]),
  queryFn: () => ReportService.get(definition.value.slug, filters),
})
const customersQuery = useQuery({
  queryKey: ['report-customers'],
  queryFn: CustomerService.getCustomerList,
  enabled: isTripReport,
})
const driversQuery = useQuery({
  queryKey: ['report-drivers'],
  queryFn: DriverService.getDriverList,
  enabled: isTripReport,
})
const vehiclesQuery = useQuery({
  queryKey: ['report-vehicles'],
  queryFn: VehicleService.getVehicleList,
  enabled: isTripReport,
})
const partnersQuery = useQuery({
  queryKey: ['report-partners'],
  queryFn: PartnerService.getPartnerList,
  enabled: isBusinessTrips,
})
const routesQuery = useQuery({
  queryKey: ['report-routes'],
  queryFn: RouteService.getRouteList,
  enabled: isBusinessTrips,
})
const detailParameters = computed<ReportFilters | null>(() => {
  const detail = definition.value.detail
  if (!detail || !selected.value?.[detail.key]) return null
  return { ...filters, [detail.key]: String(selected.value[detail.key]) }
})
const detailQuery = useQuery({
  queryKey: computed(() => [
    'restored-report-detail',
    definition.value.detail?.slug,
    detailParameters.value,
  ]),
  queryFn: () => ReportService.get(definition.value.detail!.slug, detailParameters.value!),
  enabled: computed(() => detailParameters.value !== null),
})
const money = (value: unknown) => formatMoney(Number(value ?? 0))
const isMoney = (key: string) =>
  /amount|wage|revenue|cost|profit|balance|received|paid|debit|credit|salary|commission|allowance|advance|remitted|collected|receivable/i.test(
    key,
  )
const reportFieldLabels: Record<string, string> = {
  stt: 'STT',
  account_code: 'Mã tài khoản',
  advance_amount: 'Tạm ứng',
  base_amount: 'Mức lương cơ bản',
  closing_balance: 'Dư cuối kỳ',
  code: 'Mã',
  commission: 'Hoa hồng',
  completed_at: 'Hoàn thành lúc',
  customer_code: 'Mã khách hàng',
  customer_name: 'Khách hàng',
  date: 'Ngày',
  description: 'Diễn giải',
  document_date: 'Ngày chứng từ',
  document_no: 'Số chứng từ',
  driver_name: 'Tài xế',
  driver_wage_rate: '% lương',
  driver_collected_amount: 'Lái xe thu',
  driver_remitted_amount: 'Lái xe nộp',
  driver_expense_amount: 'Lái xe chi',
  company_collected_amount: 'Công ty thu',
  remaining_receivable: 'Còn lại phải thu',
  driver_wage: 'Lương lái xe',
  expense_date: 'Ngày chi',
  expense_no: 'Số phiếu chi',
  expense_type_name: 'Loại chi phí',
  fixed_trip_amount: 'Cước xe công nhân',
  freight_amount: 'Cước xe',
  gross_salary: 'Tổng lương',
  incurred_amount: 'Phát sinh',
  is_active: 'Trạng thái',
  journey: 'Hành trình',
  license_plate: 'Biển số',
  name: 'Tên',
  net_salary: 'Thực lĩnh',
  opening_balance: 'Dư đầu kỳ',
  paid_amount: 'Đã chi',
  paid_at: 'Ngày thanh toán',
  partner_code: 'Mã chủ xe',
  partner_name: 'Chủ xe',
  payment_method: 'Phương thức thanh toán',
  payment_no: 'Số phiếu thanh toán',
  payroll_code: 'Mã bảng lương',
  profit: 'Lợi nhuận',
  rate: 'Tỷ lệ %',
  received_amount: 'Đã thu',
  received_at: 'Ngày thu',
  receipt_no: 'Số phiếu thu',
  return_date: 'Ngày về',
  return_time: 'Giờ trả',
  revenue: 'Doanh thu',
  route_code: 'Mã tuyến đường',
  route_name: 'Tuyến đường',
  run_date: 'Ngày chạy',
  run_no: 'Mã chuyến',
  shift_name: 'Ca làm việc',
  source_type: 'Nguồn công',
  status: 'Trạng thái',
  tourism_trip_amount: 'Cước xe du lịch',
  vehicle_type_name: 'Loại xe',
  work_date: 'Ngày công',
  work_units: 'Số công',
  year: 'Năm',
  month: 'Tháng',
  vehicle_plate: 'Biển số xe',
  pickup_time: 'Giờ đón',
  trip_type: 'Loại chuyến',
  partner_vehicle_cost: 'Chi phí thuê xe ngoài',
  responsibility_allowance: 'Phụ cấp trách nhiệm',
  fixed_trip_wage: 'Lương công nhân',
  tourism_commission: 'Lương du lịch',
  vehicle_type: 'Loại xe',
  external_driver_cost: 'Chi phí lái xe ngoài',
  external_vehicle_profit: 'Lợi nhuận xe',
  fuel_cost: 'Chi phí nhiên liệu',
  repair_cost: 'Chi phí sửa chữa',
  insurance_registration_cost: 'Chi phí bảo hiểm & đăng kiểm',
  other_cost: 'Chi phí khác',
  total_cost: 'Tổng chi phí',
  general_cost_allocated: 'Chi phí chung phân bổ',
  hired_driver_name: 'Tên lái thuê',
  type: 'Loại',
  debit: 'Công nợ',
  credit: 'Đã thanh toán',
  balance: 'Còn lại',
  note: 'Ghi chú',
  worker_run_no: 'Mã xe chạy (công nhân)',
  tourist_run_no: 'Mã xe chạy (du lịch)',
  amount: 'Số tiền',
}
const label = (key: string) => {
  if (props.kind === 'business-trips') {
    const businessLabels: Record<string, string> = {
      route_name: 'Tên tuyến',
      pickup_time: 'Giờ đi',
      return_time: 'Giờ về',
      driver_name: 'Tên lái xe',
      revenue: 'Cước xe',
      external_driver_cost: 'Tiền thuê lái',
      partner_vehicle_cost: 'Tiền thuê xe',
    }
    if (businessLabels[key]) return businessLabels[key]
  }
  if (props.kind === 'tourism-trips') {
    const tourismLabels: Record<string, string> = {
      driver_name: 'Tên lái xe',
      revenue: 'Cước xe',
      external_driver_cost: 'Tiền thuê lái',
    }
    if (tourismLabels[key]) return tourismLabels[key]
  }
  if (key === 'code') {
    if (props.kind === 'customer-debts') return 'Mã khách hàng'
    if (props.kind === 'partner-debts') return 'Mã chủ xe'
  }
  if (key === 'name') {
    if (props.kind === 'customer-debts') return 'Tên khách hàng'
    if (props.kind === 'partner-debts') return 'Tên chủ xe'
  }

  return reportFieldLabels[key] ?? `Dữ liệu (${key})`
}
function formatReportCell(key: string, value: unknown): string {
  if (key === 'is_active' && typeof value === 'boolean')
    return value ? 'Đang hoạt động' : 'Ngừng hoạt động'
  if (key === 'date' || /(_date|_at)$/.test(key)) return formatDate(String(value ?? ''))
  if (key === 'rate') return formatPercent(value)
  if (key === 'driver_wage_rate') return `${Number(value ?? 0) * 100}%`
  if (isMoney(key)) return money(value)
  return String(value ?? '—')
}
function formatPercent(value: unknown): string {
  const percent = Number(value ?? 0) * 100
  return Number.isFinite(percent) ? `${Number(percent.toFixed(2))}%` : '—'
}
const createColumns = (rows: ReportRow[]): DataGridColumnDef<ReportRow>[] =>
  Object.keys(rows[0] ?? {})
    .filter((key) => !/^(id|.*_id|stt)$/.test(key))
    .slice(0, 12)
    .map(createColumn)
const createColumn = (key: string): DataGridColumnDef<ReportRow> => ({
  accessorKey: key,
  header: label(key),
  width: key === 'stt' ? 70 : isMoney(key) ? 145 : 165,
  cell: ({ getValue }: { getValue: () => unknown }) => formatReportCell(key, getValue()),
  meta: { label: label(key) },
})
const tripColumnKeys: Partial<Record<ReportKind, string[]>> = {
  'business-trips': [
    'stt',
    'date',
    'vehicle_plate',
    'customer_name',
    'route_name',
    'pickup_time',
    'return_time',
    'driver_name',
    'revenue',
    'driver_wage',
    'external_driver_cost',
    'partner_vehicle_cost',
    'external_vehicle_profit',
    'partner_name',
  ],
  'tourism-trips': [
    'stt',
    'date',
    'vehicle_plate',
    'journey',
    'driver_name',
    'revenue',
    'driver_wage_rate',
    'driver_wage',
    'external_driver_cost',
    'hired_driver_name',
    'driver_collected_amount',
    'driver_remitted_amount',
    'company_collected_amount',
    'remaining_receivable',
  ],
}
const columns = computed<DataGridColumnDef<ReportRow>[]>(() => [
  ...(tripColumnKeys[props.kind]?.map(createColumn) ?? createColumns(query.data.value?.rows ?? [])),
  ...(definition.value.detail && !hasInlineDetails.value
    ? [
        {
          id: 'detail',
          header: 'Thao tác',
          fixed: 'right' as const,
          enableColumnFilter: false,
          cell: ({ row }: { row: { original: ReportRow } }) =>
            h(
              Button,
              {
                size: 'sm',
                variant: 'outline',
                onClick: () => {
                  selected.value = row.original
                },
              },
              () => [h(Eye, { class: 'mr-1 size-4' }), 'Xem chi tiết'],
            ),
          meta: { label: 'Thao tác' },
        },
      ]
    : []),
])
const detailColumns = computed(() => createColumns(detailQuery.data.value?.rows ?? []))
const source = computed<DataGridDataSource<ReportRow>>(() => ({
  data: query.data.value?.rows ?? [],
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
const totals = computed(() =>
  Object.entries(query.data.value?.totals ?? {})
    .slice(0, 4)
    .map(([key, value]) => ({ key, label: label(key), value })),
)
const pagination = { mode: 'client' as const, pageSize: 20, pageSizeOptions: [20, 50, 100] }
const rowId = (row: ReportRow) => {
  if (row.payroll_id !== undefined && row.driver_id !== undefined)
    return `payroll-${row.payroll_id}-driver-${row.driver_id}`

  return String(
    row.run_no ??
      row.payroll_id ??
      row.customer_id ??
      row.partner_id ??
      row.vehicle_plate ??
      JSON.stringify(row),
  )
}
const detailRowId = (row: ReportRow) =>
  String(
    row.stt ?? row.document_no ?? row.worker_run_no ?? row.tourist_run_no ?? JSON.stringify(row),
  )
function clearDetail() {
  expandedDebtRowId.value = null
  selected.value = null
}
function selectExpandedDebtRow(rowId: string | null) {
  expandedDebtRowId.value = rowId
  selected.value =
    rowId === null
      ? null
      : (query.data.value?.rows.find((row) => rowId === rowIdForReport(row)) ?? null)
}
function rowIdForReport(row: ReportRow) {
  return rowId(row)
}
function detailSubjectLabel(row: ReportRow): string {
  return String(row.customer_name ?? row.partner_name ?? row.name ?? 'Đối tượng đã chọn')
}
watch(() => [filters.from_date, filters.to_date, props.kind], clearDetail)
async function download(slug: string, detail = false) {
  try {
    const parameters = detail ? detailParameters.value : { ...filters }
    if (!parameters) return
    const file = await ReportService.download(slug, parameters)
    downloadFile(file)
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể xuất PDF báo cáo.')
  }
}
</script>
