<script setup lang="ts">
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleDotIcon,
  FilterIcon,
  InfoIcon,
  SearchIcon,
} from '@lucide/vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMyDispatchOrders } from './dispatch.composables'
import type { DispatchOrder } from './dispatch.types'

type DriverOrder = {
  id: string
  orderNo: string
  time: string
  endTime: string
  route: string
  customer: string
  plate: string
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING_CONFIRMATION' | 'COMPLETED'
}

const router = useRouter()
const query = ref('')
const view = ref<'today' | 'upcoming'>('today')
const ordersQuery = useMyDispatchOrders()
const formatTime = (value: string | null | undefined) =>
  value ? new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '—'
const orders = computed<DriverOrder[]>(() =>
  (ordersQuery.data.value ?? []).map((order: DispatchOrder) => ({
    id: String(order.id),
    orderNo: order.order_no,
    time: formatTime(order.trip_schedule?.scheduled_start_at),
    endTime: formatTime(order.trip_schedule?.scheduled_end_at),
    route: order.trip_schedule?.route?.name ?? order.trip_schedule?.pickup_location ?? 'Chưa có tuyến',
    customer: order.trip_schedule?.contract?.contract_no ?? 'Hợp đồng',
    plate: order.trip_assignment?.vehicle?.license_plate ?? '—',
    status: order.status as DriverOrder['status'],
  })),
)
const visibleOrders = computed(() =>
  orders.value.filter((order) =>
    `${order.id}${order.route}${order.customer}${order.plate}`
      .toLocaleLowerCase('vi-VN')
      .includes(query.value.toLocaleLowerCase('vi-VN')),
  ),
)
const statusLabel: Record<DriverOrder['status'], string> = {
  ASSIGNED: 'Đã phân công',
  IN_PROGRESS: 'Đang chạy',
  PENDING_CONFIRMATION: 'Chờ điều hành xác nhận',
  COMPLETED: 'Đã hoàn thành',
}
const statusClass = (status: DriverOrder['status']) =>
  status === 'COMPLETED'
    ? 'bg-success/10 text-success'
    : status === 'IN_PROGRESS' || status === 'PENDING_CONFIRMATION'
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300'
      : 'bg-primary/10 text-primary'
function openOrder(id: string): void {
  void router.push({ name: 'my-dispatch-order-detail', params: { id } })
}
</script>

<template>
  <section class="mx-auto max-w-5xl space-y-4 sm:space-y-5">
    <header
      class="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <div class="text-sm font-medium text-primary">Điều hành / Lệnh của tôi</div>
        <h1 class="mt-1 text-2xl font-bold tracking-tight">Lệnh của tôi</h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Các lệnh điều xe đã được phân công cho tài khoản tài xế hiện tại.
        </p>
      </div>
      <button
        class="inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm font-semibold"
      >
        <CalendarDaysIcon class="size-4 text-primary" />Hôm nay, 06/10/2026<ChevronDownIcon
          class="size-3.5"
        />
      </button>
    </header>
    <div
      class="flex items-start gap-2 rounded-lg border border-primary/15 bg-primary/[0.06] p-3 text-sm text-primary"
    >
      <InfoIcon class="mt-0.5 size-4 shrink-0" /><span
        >Chỉ hiển thị các lệnh điều xe thuộc quyền của bạn. Không thể xem lệnh của tài xế
        khác.</span
      >
    </div>
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div class="inline-flex w-fit rounded-lg border border-border bg-card p-1">
        <button
          class="rounded-md px-3 py-1.5 text-sm font-semibold"
          :class="view === 'today' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'"
          type="button"
          @click="view = 'today'"
        >
          Hôm nay</button
        ><button
          class="rounded-md px-3 py-1.5 text-sm font-semibold"
          :class="
            view === 'upcoming' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
          "
          type="button"
          @click="view = 'upcoming'"
        >
          Sắp tới
        </button>
      </div>
      <div class="flex gap-2">
        <label class="relative min-w-0 flex-1 sm:w-64"
          ><SearchIcon class="absolute left-3 top-2.5 size-4 text-muted-foreground" /><input
            v-model="query"
            class="h-9 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            placeholder="Mã lệnh, tuyến, xe..." /></label
        ><button
          class="grid size-9 place-items-center rounded-lg border border-input bg-card text-muted-foreground hover:bg-muted"
          aria-label="Lọc lệnh"
          type="button"
        >
          <FilterIcon class="size-4" />
        </button>
      </div>
    </div>
    <div class="overflow-hidden rounded-xl border border-border bg-card">
      <div class="border-b border-border px-4 py-3 sm:px-5">
        <h2 class="font-bold">Danh sách lệnh ({{ visibleOrders.length }})</h2>
      </div>
      <button
        v-for="order in visibleOrders"
        :key="order.id"
        class="group flex w-full items-center gap-3 border-b border-border px-4 py-4 text-left last:border-b-0 hover:bg-muted/55 sm:px-5"
        type="button"
        @click="openOrder(order.id)"
      >
        <span
          class="grid size-8 shrink-0 place-items-center rounded-full border-2"
          :class="
            order.status === 'COMPLETED'
              ? 'border-success text-success'
              : 'border-primary text-primary'
          "
          ><CircleDotIcon class="size-4" /></span
        ><span class="min-w-0 flex-1"
          ><span class="flex flex-wrap items-center gap-x-3 gap-y-1"
            ><strong class="text-base text-foreground">{{ order.orderNo }}</strong
            ><span
              class="rounded-full px-2 py-1 text-xs font-semibold"
              :class="statusClass(order.status)"
              >{{ statusLabel[order.status] }}</span
            ></span
          ><span class="mt-2 grid gap-1 text-sm sm:grid-cols-[150px_minmax(0,1fr)]"
            ><span class="font-semibold tabular-nums">{{ order.time }} → {{ order.endTime }}</span
            ><span class="truncate text-muted-foreground">{{ order.route }}</span></span
          ><span class="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2"
            ><span
              >Khách hàng:
              <strong class="font-medium text-foreground">{{ order.customer }}</strong></span
            ><span
              >Xe:
              <strong class="font-medium tabular-nums text-foreground">{{
                order.plate
              }}</strong></span
            ></span
          ></span
        ><ChevronRightIcon
          class="size-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </button>
    </div>
  </section>
</template>
