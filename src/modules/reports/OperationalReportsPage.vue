<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
      <div>
        <p class="text-sm font-medium text-primary">Điều hành và tài chính</p>
        <h1 class="mt-1 text-2xl font-semibold tracking-tight">Báo cáo vận hành và lợi nhuận</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Doanh thu chỉ ghi nhận từ xe chạy hoàn tất; chi phí lấy theo chứng từ phát sinh trong kỳ.
        </p>
      </div>
      <div
        class="grid w-full grid-cols-1 gap-2 rounded-lg border bg-card p-3 sm:w-auto sm:grid-cols-3 sm:items-end"
      >
        <label class="grid gap-1 text-xs font-medium text-muted-foreground"
          >Từ ngày<Input v-model="filters.from_date" type="date" class="h-9 w-full"
        /></label>
        <label class="grid gap-1 text-xs font-medium text-muted-foreground"
          >Đến ngày<Input v-model="filters.to_date" type="date" class="h-9 w-full"
        /></label>
        <Button class="w-full sm:w-auto" :disabled="isRefreshing" @click="refresh"
          ><RefreshCw class="size-4" :class="isRefreshing ? 'animate-spin' : ''" />Cập nhật</Button
        >
      </div>
    </header>

    <Tabs v-model="activeTab" class="space-y-4">
      <TabsList class="h-auto max-w-full justify-start overflow-x-auto whitespace-nowrap"
        ><TabsTrigger value="worker">Xe công nhân</TabsTrigger
        ><TabsTrigger value="tourist">Xe du lịch</TabsTrigger
        ><TabsTrigger value="profit">Lợi nhuận</TabsTrigger
        ><TabsTrigger value="payroll">Nguồn công lái xe</TabsTrigger></TabsList
      >
      <TabsContent value="worker" class="space-y-4"
        ><RunSummary :summary="worker.data.value?.summary" title="Tổng hợp xe công nhân" /><DataGrid
          :data-source="workerSource"
          :columns="runColumns"
          :pagination="pagination"
          filter-row
          global-filter
          mobile-mode="cards"
          :get-row-id="(row) => String(row.id)"
          :persist="{ key: 'report-worker-runs', url: true, queryPrefix: 'worker' }"
          empty-title="Không có xe chạy công nhân"
          empty-description="Thử thay đổi khoảng thời gian báo cáo."
          @retry="worker.refetch()"
      /></TabsContent>
      <TabsContent value="tourist" class="space-y-4"
        ><RunSummary :summary="tourist.data.value?.summary" title="Tổng hợp xe du lịch" /><DataGrid
          :data-source="touristSource"
          :columns="runColumns"
          :pagination="pagination"
          filter-row
          global-filter
          mobile-mode="cards"
          :get-row-id="(row) => String(row.id)"
          :persist="{ key: 'report-tourist-runs', url: true, queryPrefix: 'tourist' }"
          empty-title="Không có xe chạy du lịch"
          empty-description="Thử thay đổi khoảng thời gian báo cáo."
          @retry="tourist.refetch()"
      /></TabsContent>
      <TabsContent value="profit" class="space-y-4"
        ><ProfitSummary :summary="profit.data.value?.summary" />
        <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
          <DataGrid
            :data-source="profitRunSource"
            :columns="profitRunColumns"
            :pagination="pagination"
            filter-row
            global-filter
            mobile-mode="cards"
            :get-row-id="(row) => `${row.kind}-${row.id}`"
            empty-title="Không có doanh thu hoàn tất"
            empty-description="Lợi nhuận chỉ tính các chuyến đã hoàn tất trong kỳ."
            @retry="profit.refetch()"
          /><DataGrid
            :data-source="hiredDriverSource"
            :columns="hiredDriverColumns"
            :pagination="{ mode: 'client', pageSize: 10 }"
            filter-row
            global-filter
            mobile-mode="cards"
            :get-row-id="(row) => row.name"
            empty-title="Không có thuê lái"
            empty-description="Chưa có phát sinh hoặc phiếu chi thuê lái trong kỳ."
            @retry="profit.refetch()"
          /></div
      ></TabsContent>
      <TabsContent value="payroll" class="space-y-4"
        ><PayrollSummary
          :summary="payroll.data.value?.summary"
          title="Tổng hợp nguồn công" /><DataGrid
          :data-source="payrollSource"
          :columns="payrollColumns"
          :pagination="pagination"
          filter-row
          global-filter
          mobile-mode="cards"
          :get-row-id="(row) => String(row.id)"
          :persist="{ key: 'report-payroll-sources', url: true, queryPrefix: 'payroll' }"
          empty-title="Không có nguồn công"
          empty-description="Chưa có chấm công xe chạy trong khoảng thời gian này."
          @retry="payroll.refetch()"
      /></TabsContent>
    </Tabs>
  </section>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, reactive, ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { RefreshCw } from '@lucide/vue'
import type { DataGridColumnDef, DataGridDataSource } from '@/shared/components/data-grid'
import { DataGrid } from '@/shared/components/data-grid'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { formatDate, formatMoney } from '@/modules/finance/finance.format'
import { OperationalReportService } from '@/services/operational-report.service'
import type {
  HiredDriverProfitRow,
  PayrollSourceReport,
  PayrollSourceRow,
  ProfitReport,
  ReportFilters,
  RunReport,
  RunReportRow,
} from './reports.types'

const now = new Date()
const filters = reactive<ReportFilters>({
  from_date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
  to_date: now.toISOString().slice(0, 10),
})
const queryParams = computed(() => ({ ...filters }))
const worker = useQuery({
  queryKey: computed(() => ['reports', 'worker', queryParams.value]),
  queryFn: () => OperationalReportService.workerVehicles(queryParams.value),
})
const tourist = useQuery({
  queryKey: computed(() => ['reports', 'tourist', queryParams.value]),
  queryFn: () => OperationalReportService.touristVehicles(queryParams.value),
})
const profit = useQuery({
  queryKey: computed(() => ['reports', 'profit', queryParams.value]),
  queryFn: () => OperationalReportService.profit(queryParams.value),
})
const payroll = useQuery({
  queryKey: computed(() => ['reports', 'payroll', queryParams.value]),
  queryFn: () => OperationalReportService.payrollSources(queryParams.value),
})
const activeTab = ref('worker')
const pagination = { mode: 'client' as const, pageSize: 20, pageSizeOptions: [20, 50, 100] }
const workerSource = computed<DataGridDataSource<RunReportRow>>(() => ({
  data: worker.data.value?.rows ?? [],
  isLoading: worker.isLoading.value,
  isFetching: worker.isFetching.value,
  error: worker.error.value,
}))
const touristSource = computed<DataGridDataSource<RunReportRow>>(() => ({
  data: tourist.data.value?.rows ?? [],
  isLoading: tourist.isLoading.value,
  isFetching: tourist.isFetching.value,
  error: tourist.error.value,
}))
const profitRunSource = computed<DataGridDataSource<RunReportRow>>(() => ({
  data: profit.data.value?.revenue_runs ?? [],
  isLoading: profit.isLoading.value,
  isFetching: profit.isFetching.value,
  error: profit.error.value,
}))
const payrollSource = computed<DataGridDataSource<PayrollSourceRow>>(() => ({
  data: payroll.data.value?.rows ?? [],
  isLoading: payroll.isLoading.value,
  isFetching: payroll.isFetching.value,
  error: payroll.error.value,
}))
const hiredDriverSource = computed<DataGridDataSource<HiredDriverProfitRow>>(() => ({
  data: profit.data.value?.hired_drivers ?? [],
  isLoading: profit.isLoading.value,
  isFetching: profit.isFetching.value,
  error: profit.error.value,
}))
const statusClass = (value: string) =>
  ({
    completed: 'bg-success/15 text-success',
    in_progress: 'bg-primary/10 text-primary',
    cancelled: 'bg-destructive/10 text-destructive',
    planned: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  })[value] ?? 'bg-muted text-muted-foreground'
const statusLabel = (value: string) =>
  ({ completed: 'Hoàn tất', in_progress: 'Đang chạy', cancelled: 'Đã hủy', planned: 'Chờ chạy' })[
    value
  ] ?? value
const sourceLabel = (value: string) => (value === 'worker' ? 'Xe công nhân' : 'Xe du lịch')
const runColumns: DataGridColumnDef<RunReportRow>[] = [
  {
    accessorKey: 'run_date',
    header: 'Ngày chạy',
    fixed: 'left',
    cell: ({ getValue }) => formatDate(String(getValue())),
    meta: { label: 'Ngày chạy' },
  },
  { accessorKey: 'run_no', header: 'Mã chuyến', meta: { label: 'Mã chuyến' } },
  {
    accessorKey: 'journey',
    header: 'Tuyến / hành trình',
    cell: ({ getValue }) => String(getValue() ?? '—'),
    meta: { label: 'Tuyến / hành trình' },
  },
  {
    accessorKey: 'customer_name',
    header: 'Khách hàng',
    cell: ({ getValue }) => String(getValue() ?? '—'),
    meta: { label: 'Khách hàng' },
  },
  {
    accessorKey: 'license_plate',
    header: 'Biển số',
    cell: ({ getValue }) =>
      h('span', { class: 'font-semibold tabular-nums' }, String(getValue() ?? '—')),
    meta: { label: 'Biển số' },
  },
  {
    accessorKey: 'driver_name',
    header: 'Tài xế',
    cell: ({ getValue }) => String(getValue() ?? '—'),
    meta: { label: 'Tài xế' },
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ getValue }) =>
      h(
        'span',
        {
          class: `rounded-full px-2 py-1 text-xs font-semibold ${statusClass(String(getValue()))}`,
        },
        statusLabel(String(getValue())),
      ),
    meta: { label: 'Trạng thái' },
  },
  {
    accessorKey: 'freight_amount',
    header: 'Cước',
    cell: ({ getValue }) => formatMoney(getValue() as string | number),
    align: 'right',
    meta: { label: 'Cước' },
  },
  {
    accessorKey: 'driver_wage',
    header: 'Lương lái xe',
    cell: ({ getValue }) => formatMoney(getValue() as string | number),
    align: 'right',
    meta: { label: 'Lương lái xe' },
  },
]
const profitRunColumns: DataGridColumnDef<RunReportRow>[] = [
  runColumns[0]!,
  runColumns[1]!,
  runColumns[2]!,
  runColumns[3]!,
  runColumns[4]!,
  {
    accessorKey: 'kind',
    header: 'Loại xe chạy',
    cell: ({ getValue }) => sourceLabel(String(getValue())),
    meta: { label: 'Loại xe chạy' },
  },
  runColumns[7]!,
]
const hiredDriverColumns: DataGridColumnDef<HiredDriverProfitRow>[] = [
  { accessorKey: 'name', header: 'Thuê lái', fixed: 'left', meta: { label: 'Thuê lái' } },
  {
    accessorKey: 'incurred_amount',
    header: 'Phát sinh',
    cell: ({ getValue }) => formatMoney(getValue() as string | number),
    align: 'right',
    meta: { label: 'Phát sinh' },
  },
  {
    accessorKey: 'paid_amount',
    header: 'Đã trả',
    cell: ({ getValue }) => formatMoney(getValue() as string | number),
    align: 'right',
    meta: { label: 'Đã trả' },
  },
  {
    accessorKey: 'outstanding_amount',
    header: 'Còn nợ',
    cell: ({ getValue }) => formatMoney(getValue() as string | number),
    align: 'right',
    meta: { label: 'Còn nợ' },
  },
]
const payrollColumns: DataGridColumnDef<PayrollSourceRow>[] = [
  {
    accessorKey: 'work_date',
    header: 'Ngày công',
    fixed: 'left',
    cell: ({ getValue }) => formatDate(String(getValue())),
    meta: { label: 'Ngày công' },
  },
  {
    accessorKey: 'driver_name',
    header: 'Tài xế',
    cell: ({ getValue }) => String(getValue() ?? '—'),
    meta: { label: 'Tài xế' },
  },
  {
    accessorKey: 'source_type',
    header: 'Nguồn công',
    cell: ({ getValue }) => sourceLabel(String(getValue())),
    meta: { label: 'Nguồn công' },
  },
  {
    accessorKey: 'run_no',
    header: 'Mã chuyến',
    cell: ({ getValue }) => String(getValue() ?? '—'),
    meta: { label: 'Mã chuyến' },
  },
  {
    accessorKey: 'license_plate',
    header: 'Biển số',
    cell: ({ getValue }) => String(getValue() ?? '—'),
    meta: { label: 'Biển số' },
  },
  {
    accessorKey: 'calculated_wage',
    header: 'Tiền công',
    cell: ({ getValue }) => formatMoney(getValue() as string | number),
    align: 'right',
    meta: { label: 'Tiền công' },
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ getValue }) => statusLabel(String(getValue())),
    meta: { label: 'Trạng thái' },
  },
]
const RunSummary = defineComponent({
  props: { summary: Object, title: String },
  setup(props) {
    return () =>
      h('div', { class: 'space-y-2' }, [
        h('p', { class: 'text-sm font-semibold' }, props.title),
        h('div', { class: 'grid gap-3 sm:grid-cols-2 xl:grid-cols-4' }, [
          summaryCardFrom(props.summary, 'Chuyến hoàn tất', 'completed_runs'),
          summaryCardFrom(props.summary, 'Cước đã chốt', 'freight_amount', true),
          summaryCardFrom(props.summary, 'Lương lái xe', 'driver_wage'),
          summaryCardFrom(props.summary, 'Chi thuê lái', 'hired_driver_cost'),
        ]),
      ])
  },
})
const ProfitSummary = defineComponent({
  props: { summary: Object },
  setup(props) {
    return () =>
      h('div', { class: 'grid gap-3 sm:grid-cols-2 xl:grid-cols-4' }, [
        summaryCardFrom(props.summary, 'Doanh thu công nhân', 'worker_revenue'),
        summaryCardFrom(props.summary, 'Doanh thu du lịch', 'tourist_revenue'),
        summaryCardFrom(props.summary, 'Tổng chi chứng từ', 'total_costs'),
        summaryCardFrom(props.summary, 'Lợi nhuận', 'profit', true),
      ])
  },
})
const PayrollSummary = defineComponent({
  props: { summary: Object },
  setup(props) {
    return () =>
      h('div', { class: 'grid gap-3 sm:grid-cols-3' }, [
        summaryCardFrom(props.summary, 'Lương công nhân', 'worker_wage'),
        summaryCardFrom(props.summary, 'Lương du lịch', 'tourist_wage'),
        summaryCardFrom(props.summary, 'Tổng tiền công', 'total_wage', true),
      ])
  },
})
function summaryCardFrom(summary: unknown, label: string, key: string, emphasis = false) {
  const values = summary as Record<string, string | number> | undefined
  return h(
    'div',
    {
      class: emphasis
        ? 'rounded-lg border border-primary/25 bg-primary/5 p-4'
        : 'rounded-lg border bg-card p-4',
    },
    [
      h('p', { class: 'text-xs text-muted-foreground' }, label),
      h(
        'p',
        {
          class: emphasis
            ? 'mt-1 text-xl font-semibold tabular-nums text-primary'
            : 'mt-1 text-xl font-semibold tabular-nums',
        },
        formatMoney(values?.[key]),
      ),
    ],
  )
}
const isRefreshing = computed(
  () =>
    worker.isFetching.value ||
    tourist.isFetching.value ||
    profit.isFetching.value ||
    payroll.isFetching.value,
)
function refresh() {
  void Promise.all([worker.refetch(), tourist.refetch(), profit.refetch(), payroll.refetch()])
}
</script>
