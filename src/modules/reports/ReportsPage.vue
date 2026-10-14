<script setup lang="ts">
import type { ReportFilters, ReportKind } from './report.types'
import { ReportService } from '@/services/report.service'
import { useAuthStore } from '@/modules/auth/auth.store'
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

const props = defineProps<{ kind: ReportKind }>()
const auth = useAuthStore()
const now = new Date()
const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
const filters = ref<ReportFilters>({ from_date: first, to_date: last, basis: 'accrual' })
const financeTab = ref('cashflow')
const title = computed(
  () =>
    ({
      'fixed-trips': 'Báo cáo xe chạy tuyến',
      'tourism-trips': 'Báo cáo xe du lịch/công tác',
      finance: 'Thu chi, chi phí và công nợ',
      'driver-payroll': 'Báo cáo lương',
      'profit-loss': 'Báo cáo lợi nhuận',
    })[props.kind],
)
const slug = computed(() => (props.kind === 'finance' ? financeTab.value : props.kind))
const query = useQuery({
  queryKey: computed(() => ['reports', slug.value, filters.value]),
  queryFn: () => ReportService.get(slug.value, filters.value),
})
const columns = computed<DataGridColumnDef<Record<string, unknown>>[]>(() =>
  Object.keys(query.data.value?.rows[0] ?? {})
    .filter((key) => !['id', 'schedule_id', 'details', 'expense_breakdown'].includes(key))
    .map((key) => ({
      accessorKey: key,
      header: key.replaceAll('_', ' '),
      meta: { label: key.replaceAll('_', ' ') },
    })),
)
const source = computed<DataGridDataSource<Record<string, unknown>>>(() => ({
  data: query.data.value?.rows ?? [],
  isLoading: query.isLoading.value,
  isFetching: query.isFetching.value,
  error: query.error.value,
}))
const totals = computed(() => Object.entries(query.data.value?.totals ?? {}))
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
    const file = await ReportService.download(slug.value, filters.value)
    const url = URL.createObjectURL(file.blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.filename
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Không thể xuất Excel.')
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
      <Button :disabled="query.isFetching.value" @click="download"
        ><Download class="size-4" />Xuất Excel</Button
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
