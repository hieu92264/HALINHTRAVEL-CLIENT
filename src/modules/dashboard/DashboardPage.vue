<script setup lang="ts">
import {
  AlertTriangleIcon,
  BusFrontIcon,
  CalendarDaysIcon,
  CircleDollarSignIcon,
  Clock3Icon,
  MapPinIcon,
  RefreshCwIcon,
  UserRoundIcon,
  WifiIcon,
  WifiOffIcon,
} from '@lucide/vue'
import { useQueryClient } from '@tanstack/vue-query'
import { computed, onBeforeUnmount, ref } from 'vue'
import { dashboardQueryKeys, useDashboardOverviewQuery } from './dashboard.composables'
import {
  dashboardAlertClass,
  dashboardStatusClass,
  dashboardStatusLabel,
  formatDashboardDateTime,
  formatDashboardMoney,
} from './dashboard.format'
import type { DashboardUpdatedEvent } from './dashboard.types'
import { useDashboardRealtime } from './useDashboardRealtime'

const selectedDate = ref(new Date().toISOString().slice(0, 10))
const queryClient = useQueryClient()
const overviewQuery = useDashboardOverviewQuery(() => selectedDate.value)
let refreshTimer: ReturnType<typeof setTimeout> | null = null

const overview = computed(() => overviewQuery.data.value)
const operations = computed(() => overview.value?.operations.available ? overview.value.operations : null)
const alerts = computed(() => overview.value?.alerts.available ? overview.value.alerts : null)
const fleet = computed(() => overview.value?.fleet.available ? overview.value.fleet : null)
const finance = computed(() => overview.value?.finance.available ? overview.value.finance : null)
const alertCount = computed(() => alerts.value?.items.reduce((total, alert) => total + alert.count, 0) ?? 0)
const dateLabel = computed(() => new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
}).format(new Date(`${selectedDate.value}T00:00:00`)))
const updatedLabel = computed(() => overview.value?.generated_at
  ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(overview.value.generated_at))
  : '—')

const refresh = async () => overviewQuery.refetch()
const onDashboardUpdated = (_event: DashboardUpdatedEvent) => {
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => {
    void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.overview(selectedDate.value) })
  }, 800)
}
const { status: realtimeStatus } = useDashboardRealtime(onDashboardUpdated)

onBeforeUnmount(() => {
  if (refreshTimer) clearTimeout(refreshTimer)
})
</script>

<template>
  <section class="mx-auto max-w-[1440px] space-y-6">
    <header class="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div class="flex items-center gap-2 text-sm font-medium text-primary"><CalendarDaysIcon class="size-4" />{{ dateLabel }}</div>
        <h1 class="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">Điều hành vận tải</h1>
        <p class="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Theo dõi lịch xe, phân công và các ngoại lệ cần xử lý trong ngày.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <label class="sr-only" for="dashboard-date">Ngày điều hành</label>
        <input id="dashboard-date" v-model="selectedDate" type="date" class="h-9 rounded-lg border border-input bg-background px-3 text-sm" />
        <span class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium" :class="realtimeStatus === 'connected' ? 'text-emerald-600' : 'text-muted-foreground'">
          <WifiIcon v-if="realtimeStatus === 'connected'" class="size-3.5" /><WifiOffIcon v-else class="size-3.5" />
          {{ realtimeStatus === 'connected' ? 'Realtime đang hoạt động' : realtimeStatus === 'connecting' ? 'Đang kết nối realtime' : realtimeStatus === 'disabled' ? 'Realtime chưa cấu hình' : realtimeStatus === 'unavailable' ? 'Realtime không áp dụng' : 'Mất kết nối realtime' }}
        </span>
        <button type="button" class="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted disabled:opacity-50" :disabled="overviewQuery.isFetching.value" @click="refresh">
          <RefreshCwIcon class="size-4" :class="overviewQuery.isFetching.value ? 'animate-spin' : ''" />Làm mới
        </button>
      </div>
    </header>

    <p v-if="overview" class="-mt-3 text-xs text-muted-foreground">Dữ liệu cập nhật lúc {{ updatedLabel }}</p>
    <div v-if="overviewQuery.isError.value" class="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Không thể tải dữ liệu Tổng quan. <button type="button" class="font-semibold underline" @click="refresh">Thử lại</button></div>

    <template v-if="overviewQuery.isPending.value">
      <div class="grid gap-4 sm:grid-cols-3"><div v-for="item in 3" :key="item" class="h-28 animate-pulse rounded-2xl bg-muted" /></div>
      <div class="h-96 animate-pulse rounded-2xl bg-muted" />
    </template>

    <template v-else-if="overview">
      <div v-if="operations" class="grid gap-4 sm:grid-cols-3">
        <article class="rounded-2xl border border-border bg-card p-5"><p class="text-sm text-muted-foreground">Chuyến trong ngày</p><p class="mt-2 text-3xl font-bold tabular-nums">{{ operations.counts.total }}</p></article>
        <article class="rounded-2xl border border-border bg-card p-5"><p class="text-sm text-muted-foreground">Đã hoàn tất</p><p class="mt-2 text-3xl font-bold tabular-nums text-emerald-600">{{ operations.counts.completed }}</p></article>
        <article class="rounded-2xl border border-border bg-card p-5"><p class="text-sm text-muted-foreground">Việc cần xử lý</p><p class="mt-2 text-3xl font-bold tabular-nums text-amber-600">{{ alertCount }}</p></article>
      </div>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <article class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div class="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6"><div><h2 class="text-base font-bold">Lịch xe</h2><p class="mt-0.5 text-xs text-muted-foreground">Các chuyến giao với ngày đang xem</p></div><Clock3Icon class="size-5 text-muted-foreground" /></div>
          <div v-if="!operations" class="p-6 text-sm text-muted-foreground">Bạn chưa có quyền xem lịch chuyến.</div>
          <ol v-else-if="operations.schedules.length" class="divide-y divide-border">
            <li v-for="schedule in operations.schedules" :key="schedule.id" class="p-5 sm:px-6">
              <div class="grid gap-4 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center">
                <time class="font-semibold tabular-nums">{{ formatDashboardDateTime(schedule.scheduled_start_at) }}</time>
                <div class="relative min-w-0 border-l-2 border-primary/25 pl-5">
                  <span class="absolute -left-1.5 top-1.5 size-3 rounded-full border-[3px] border-card bg-primary" />
                  <p class="truncate text-sm font-semibold">{{ schedule.route_name || [schedule.pickup_location, schedule.dropoff_location].filter(Boolean).join(' → ') || schedule.schedule_no }}</p>
                  <p class="mt-1 text-xs text-muted-foreground">{{ schedule.vehicle_type_name || 'Chưa xác định loại xe' }} · {{ schedule.service_type || '—' }}</p>
                  <div class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground"><span class="inline-flex items-center gap-1.5"><BusFrontIcon class="size-3.5 text-primary" /><strong class="font-semibold text-foreground">{{ schedule.vehicle_plate || 'Chưa phân xe' }}</strong></span><span class="inline-flex items-center gap-1.5"><UserRoundIcon class="size-3.5" />{{ schedule.driver_name || 'Chưa phân tài xế' }}</span></div>
                </div>
                <span v-if="schedule.status" class="w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset" :class="dashboardStatusClass[schedule.status]">{{ dashboardStatusLabel[schedule.status] }}</span>
              </div>
            </li>
          </ol>
          <div v-else class="p-8 text-center text-sm text-muted-foreground">Không có lịch chuyến trong ngày này.</div>
        </article>

        <aside class="space-y-6">
          <article v-if="alerts" class="rounded-2xl border p-5" :class="alerts.items.length ? dashboardAlertClass[alerts.items[0]?.severity || 'info'] : 'border-border bg-card'">
            <div class="flex items-start gap-3"><span class="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700"><AlertTriangleIcon class="size-5" /></span><div><h2 class="text-sm font-bold">Cần xử lý</h2><p class="mt-1 text-xs leading-5 text-muted-foreground">{{ alertCount ? `${alertCount} ngoại lệ cần theo dõi.` : 'Chưa có ngoại lệ vận hành.' }}</p></div></div>
            <ul v-if="alerts.items.length" class="mt-4 space-y-3 border-t border-border/60 pt-4"><li v-for="alert in alerts.items" :key="alert.type" class="text-sm leading-5">{{ alert.message }}</li></ul>
          </article>

          <article v-if="finance" class="rounded-2xl border border-border bg-card p-5">
            <div class="flex items-center gap-3"><span class="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><CircleDollarSignIcon class="size-5" /></span><div><h2 class="text-sm font-bold">Dòng tiền trong ngày</h2><p class="text-xs text-muted-foreground">Theo quyền tài chính của bạn</p></div></div>
            <dl class="mt-5 space-y-3 text-sm"><div class="flex justify-between gap-4"><dt class="text-muted-foreground">Đã thu</dt><dd class="font-bold tabular-nums">{{ formatDashboardMoney(finance.receipts) }}</dd></div><div class="flex justify-between gap-4"><dt class="text-muted-foreground">Chi phí</dt><dd class="font-bold tabular-nums">{{ formatDashboardMoney(finance.expenses) }}</dd></div><div class="flex justify-between gap-4"><dt class="text-muted-foreground">Chi đối tác</dt><dd class="font-bold tabular-nums">{{ formatDashboardMoney(finance.partner_payments) }}</dd></div><div class="flex justify-between gap-4 border-t border-border pt-3"><dt class="font-medium">Dòng tiền ròng</dt><dd class="font-bold tabular-nums text-emerald-600">{{ formatDashboardMoney(finance.net_cash) }}</dd></div></dl>
          </article>
        </aside>
      </div>

      <article v-if="fleet" class="overflow-hidden rounded-2xl border border-border bg-card"><div class="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-6"><MapPinIcon class="size-5 text-primary" /><div><h2 class="text-base font-bold">Năng lực vận hành</h2><p class="mt-0.5 text-xs text-muted-foreground">Tình trạng đội xe và phân công trong ngày</p></div></div><div class="grid divide-y divide-border sm:grid-cols-4 sm:divide-x sm:divide-y-0"><div v-if="fleet.vehicles" class="p-5 sm:px-6"><p class="text-sm text-muted-foreground">Xe sẵn sàng</p><p class="mt-1 text-2xl font-bold tabular-nums">{{ fleet.vehicles.available }} <span class="text-sm font-medium text-muted-foreground">/ {{ fleet.vehicles.total }} xe</span></p></div><div v-if="fleet.vehicles" class="p-5 sm:px-6"><p class="text-sm text-muted-foreground">Xe cần kiểm tra</p><p class="mt-1 text-2xl font-bold tabular-nums text-amber-600">{{ fleet.vehicles.maintenance + fleet.vehicles.inactive }}</p></div><div v-if="fleet.drivers" class="p-5 sm:px-6"><p class="text-sm text-muted-foreground">Tài xế đã phân công</p><p class="mt-1 text-2xl font-bold tabular-nums">{{ fleet.drivers.assigned }} <span class="text-sm font-medium text-muted-foreground">/ {{ fleet.drivers.active }} người</span></p></div><div v-if="fleet.drivers" class="p-5 sm:px-6"><p class="text-sm text-muted-foreground">Tài xế còn sẵn sàng</p><p class="mt-1 text-2xl font-bold tabular-nums text-emerald-600">{{ fleet.drivers.available }}</p></div></div></article>
    </template>
  </section>
</template>
