<script setup lang="ts">
import type { ReportExportFormat, ReportFilters, ReportKind } from './report.types'
import { ReportService } from '@/services/report.service'
import { useAuthStore } from '@/modules/auth/auth.store'
import { useCustomerOptionsQuery } from '@/modules/master-data/customer/composables/useCustomerQueries'
import { usePartnerOptionsQuery } from '@/modules/master-data/partner/composables/usePartnerQueries'
import { usePayrollsQuery } from '@/modules/finance/finance.composables'
import {
  DataGrid,
  type DataGridColumnDef,
  type DataGridDataSource,
} from '@/shared/components/data-grid'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { computed, ref, watch } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { Download, RefreshCw } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { formatDate, formatMoney } from '@/modules/finance/finance.format'

const props = defineProps<{ kind: ReportKind }>()
const auth = useAuthStore()
const now = new Date()
const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
const filters = ref<ReportFilters>({ from_date: first, to_date: last, basis: 'accrual' })
const financeTab = ref('cashflow')
const customers = useCustomerOptionsQuery()
const partners = usePartnerOptionsQuery()
const payrolls = usePayrollsQuery()
const requiresCustomer = computed(() => props.kind === 'customer-debt-details')
const requiresPartner = computed(() => props.kind === 'partner-debt-details')
const requiresPayroll = computed(() => props.kind === 'driver-payroll-details')
const exportFormat = computed<ReportExportFormat>(() =>
  ['fixed-trips', 'tourism-trips', 'customer-debts', 'customer-debt-details', 'partner-debts', 'partner-debt-details', 'driver-payroll', 'driver-payroll-details', 'vehicle-profit'].includes(props.kind) ? 'docx' : 'xlsx',
)
const exportLabel = computed(() =>
  exportFormat.value === 'docx' ? 'Xuất Word' : 'Xuất Excel',
)
const hasRequiredFilter = computed(
  () => (!requiresCustomer.value || Boolean(filters.value.customer_id)) && (!requiresPartner.value || Boolean(filters.value.partner_id)) && (!requiresPayroll.value || Boolean(filters.value.payroll_id)),
)
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
  enabled: hasRequiredFilter,
})
const customerDebtDetailColumns: DataGridColumnDef<Record<string, unknown>>[] = [
  { accessorKey: 'stt', header: 'STT', meta: { label: 'STT' } },
  {
    accessorKey: 'date',
    header: 'Ngày',
    meta: { label: 'Ngày' },
    cell: ({ getValue }) => formatDate(String(getValue() ?? '')),
  },
  {
    id: 'description',
    header: 'Diễn giải/Hành trình',
    meta: { label: 'Diễn giải/Hành trình' },
    cell: ({ row }) =>
      [row.original.type, row.original.journey].filter(Boolean).join(' ') || '—',
  },
  { accessorKey: 'vehicle_plate', header: 'Biển số', meta: { label: 'Biển số' } },
  { accessorKey: 'pickup_time', header: 'Giờ đón', meta: { label: 'Giờ đón' } },
  { accessorKey: 'return_time', header: 'Giờ về', meta: { label: 'Giờ về' } },
  { accessorKey: 'note', header: 'Ghi chú', meta: { label: 'Ghi chú' } },
  {
    accessorKey: 'debit',
    header: 'Nợ phát sinh',
    meta: { label: 'Nợ phát sinh' },
    cell: ({ getValue }) => formatMoney(Number(getValue() ?? 0)),
  },
  {
    accessorKey: 'credit',
    header: 'Có phát sinh',
    meta: { label: 'Có phát sinh' },
    cell: ({ getValue }) => formatMoney(Number(getValue() ?? 0)),
  },
  {
    accessorKey: 'balance',
    header: 'Nợ cuối kỳ',
    meta: { label: 'Nợ cuối kỳ' },
    cell: ({ getValue }) => formatMoney(Number(getValue() ?? 0)),
  },
]
const columns = computed<DataGridColumnDef<Record<string, unknown>>[]>(() => {
  if (props.kind === 'customer-debt-details') return customerDebtDetailColumns

  return Object.keys(query.data.value?.rows[0] ?? {})
    .filter((key) => !['id', 'schedule_id', 'details', 'expense_breakdown'].includes(key))
    .map((key) => ({
      accessorKey: key,
      header: key.replaceAll('_', ' '),
      meta: { label: key.replaceAll('_', ' ') },
    }))
})
const source = computed<DataGridDataSource<Record<string, unknown>>>(() => ({
  data: query.data.value?.rows ?? [],
  isLoading: query.isLoading.value,
  isFetching: query.isFetching.value,
  error: query.error.value,
}))
const totals = computed(() => {
  if (props.kind === 'customer-debt-details') {
    const data = query.data.value?.totals ?? {}
    return [
      ['Nợ đầu kỳ', formatMoney(Number(data.opening_balance ?? 0))],
      ['Nợ cuối kỳ', formatMoney(Number(data.closing_balance ?? 0))],
    ]
  }

  return Object.entries(query.data.value?.totals ?? {})
})
const can = (permission: string) => auth.user?.permissions.includes(permission) ?? false
type FinanceTab = [string, string]
const financeTabs = computed<FinanceTab[]>(() => {
  const tabs: Array<FinanceTab | null> = [
    can('receipts.view') &&
    can('expenses.view') &&
    can('partner-payments.view') &&
    can('driver-advances.view')
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
function reset() {
  filters.value = { from_date: first, to_date: last, basis: 'accrual' }
}
async function download() {
  try {
    const file = await ReportService.download(slug.value, filters.value, exportFormat.value)
    const url = URL.createObjectURL(file.blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.filename
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    toast.error(error instanceof Error ? error.message : `Không thể xuất ${exportLabel.value}.`)
  }
}
</script>

<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">{{ title }}</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Đối soát dữ liệu vận hành và tài chính theo kỳ.
        </p>
      </div>
      <Button :disabled="query.isFetching.value || !hasRequiredFilter" @click="download"
        ><Download class="size-4" />{{ exportLabel }}</Button
      >
    </header>
    <Tabs v-if="kind === 'finance'" v-model="financeTab"
      ><TabsList
        ><TabsTrigger v-for="tab in financeTabs" :key="tab[0]" :value="tab[0]">{{
          tab[1]
        }}</TabsTrigger></TabsList
      ><TabsContent :value="financeTab"
    /></Tabs>
    <div class="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
      <label class="grid gap-1 text-sm"
        >Từ ngày<Input v-model="filters.from_date" type="date" /></label
      ><label class="grid gap-1 text-sm"
        >Đến ngày<Input v-model="filters.to_date" type="date" /></label
      ><label v-if="kind === 'profit-loss'" class="grid gap-1 text-sm"
        >Cơ sở<select v-model="filters.basis" class="h-9 rounded-md border bg-background px-3">
          <option value="accrual">Dồn tích</option>
          <option value="cash">Tiền mặt</option>
        </select></label
      ><label v-if="requiresCustomer" class="grid gap-1 text-sm"
        >Khách hàng<select v-model="filters.customer_id" class="h-9 min-w-56 rounded-md border bg-background px-3">
          <option value="">Chọn khách hàng</option>
          <option v-for="customer in customers.data.value ?? []" :key="customer.value" :value="String(customer.value)">{{ customer.label }}</option>
        </select></label
      ><label v-if="requiresPartner" class="grid gap-1 text-sm"
        >Chủ xe/hãng vận tải<select v-model="filters.partner_id" class="h-9 min-w-56 rounded-md border bg-background px-3">
          <option value="">Chọn chủ xe/hãng vận tải</option>
          <option v-for="partner in partners.data.value ?? []" :key="partner.id" :value="String(partner.id)">{{ partner.name }}</option>
        </select></label
      ><label v-if="requiresPayroll" class="grid gap-1 text-sm"
        >Kỳ lương<select v-model="filters.payroll_id" class="h-9 min-w-56 rounded-md border bg-background px-3">
          <option value="">Chọn kỳ lương</option>
          <option v-for="payroll in payrolls.data.value ?? []" :key="payroll.id" :value="String(payroll.id)">{{ payroll.code }} ({{ payroll.from_date }} - {{ payroll.to_date }})</option>
        </select></label
      ><Button variant="outline" @click="reset">Đặt lại</Button
      ><Button variant="outline" @click="query.refetch()"
        ><RefreshCw class="size-4" />Cập nhật</Button
      >
    </div>
    <div v-if="totals.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <article v-for="[key, value] in totals" :key="key" class="rounded-lg border bg-card p-4">
        <p class="text-xs text-muted-foreground">{{ key.replaceAll('_', ' ') }}</p>
        <p class="mt-1 text-lg font-semibold tabular-nums">{{ value }}</p>
      </article>
    </div>
    <DataGrid
      :data-source="source"
      :columns="columns"
      :pagination="{ mode: 'client', pageSize: 25, pageSizeOptions: [25, 50, 100] }"
      filter-row
      global-filter
      :get-row-id="(row, index) => String(row.id ?? index)"
      :persist="{ key: `report-${slug}`, url: true, queryPrefix: 'report' }"
      empty-title="Không có dữ liệu trong kỳ"
      empty-description="Thử điều chỉnh khoảng thời gian hoặc bộ lọc."
      @retry="query.refetch()"
    />
  </section>
</template>
