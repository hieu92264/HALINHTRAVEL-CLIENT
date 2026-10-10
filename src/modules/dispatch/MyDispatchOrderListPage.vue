<script setup lang="ts">
import { CalendarDaysIcon, ChevronRightIcon, CircleDotIcon, SearchIcon } from '@lucide/vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMyDispatchOrders } from './dispatch.composables'
import { orderStatusLabels } from './dispatch.format'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'

const router = useRouter()
const query = ref('')
const view = ref<'today' | 'upcoming'>('today')
const ordersQuery = useMyDispatchOrders()
const today = new Date().toISOString().slice(0, 10)

const formatTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : '—'

const visibleOrders = computed(() =>
  (ordersQuery.data.value ?? []).filter((order) => {
    const date = order.trip_schedule?.scheduled_start_at?.slice(0, 10)
    const inPeriod = view.value === 'today' ? date === today : date !== today
    const haystack = `${order.order_no}${order.trip_schedule?.route?.name ?? ''}${order.trip_schedule?.pickup_location ?? ''}${order.trip_assignment?.vehicle?.license_plate ?? ''}`.toLocaleLowerCase(
      'vi-VN',
    )
    return inPeriod && haystack.includes(query.value.toLocaleLowerCase('vi-VN'))
  }),
)

function openOrder(id: number): void {
  void router.push({ name: 'my-dispatch-order-detail', params: { id } })
}
</script>

<template>
  <section class="mx-auto max-w-5xl space-y-5">
    <header class="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div class="flex items-center gap-2 text-sm font-medium text-primary">
          Điều hành / Lệnh của tôi
        </div>
        <h1 class="mt-2 text-2xl font-bold tracking-tight text-foreground">
          Lệnh của tôi
        </h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Các lệnh điều xe thuộc tài khoản tài xế hiện tại.
        </p>
      </div>
      <span class="inline-flex h-10 items-center gap-2 rounded-lg border border-input bg-card px-4 text-sm font-semibold shadow-sm">
        <CalendarDaysIcon class="size-4 text-primary" />
        {{ new Date().toLocaleDateString('vi-VN') }}
      </span>
    </header>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="inline-flex w-fit rounded-lg border border-border bg-card p-1 shadow-sm">
        <button
          class="rounded-md px-4 py-1.5 text-sm font-semibold transition-colors"
          :class="
            view === 'today'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          "
          type="button"
          @click="view = 'today'"
        >
          Hôm nay
        </button>
        <button
          class="rounded-md px-4 py-1.5 text-sm font-semibold transition-colors"
          :class="
            view === 'upcoming'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          "
          type="button"
          @click="view = 'upcoming'"
        >
          Sắp tới
        </button>
      </div>

      <div class="relative min-w-0 sm:w-72">
        <SearchIcon class="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          v-model="query"
          class="pl-9 shadow-sm"
          placeholder="Mã lệnh, tuyến, xe..."
        />
      </div>
    </div>

    <div
      v-if="ordersQuery.isPending.value"
      class="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm"
    >
      <div class="mx-auto grid size-12 place-items-center rounded-full bg-muted">
        <span class="size-5 animate-pulse rounded-full bg-primary/20" />
      </div>
      <p class="mt-3 font-medium">Đang tải danh sách lệnh…</p>
    </div>

    <div
      v-else-if="ordersQuery.isError.value"
      class="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center shadow-sm"
    >
      <p class="text-sm font-medium text-destructive">Không thể tải danh sách lệnh.</p>
      <Button
        variant="outline"
        size="sm"
        class="mt-3 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        @click="ordersQuery.refetch()"
      >
        Thử lại
      </Button>
    </div>

    <div v-else class="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div class="border-b border-border bg-muted/20 px-5 py-3.5">
        <h2 class="font-bold text-foreground">
          Danh sách lệnh ({{ visibleOrders.length }})
        </h2>
      </div>

      <div
        v-if="visibleOrders.length === 0"
        class="flex flex-col items-center justify-center p-12 text-center"
      >
        <div class="grid size-12 place-items-center rounded-full bg-primary/10">
          <CalendarDaysIcon class="size-6 text-primary" />
        </div>
        <p class="mt-4 text-sm font-medium text-foreground">
          Không có lệnh phù hợp
        </p>
        <p class="mt-1 text-sm text-muted-foreground">
          Không tìm thấy lệnh nào trong khoảng thời gian đã chọn.
        </p>
      </div>

      <div v-else class="divide-y divide-border">
        <button
          v-for="order in visibleOrders"
          :key="order.id"
          class="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/50"
          type="button"
          @click="openOrder(order.id)"
        >
          <span
            class="grid size-9 shrink-0 place-items-center rounded-full border-2 bg-background"
            :class="{
              'border-success text-success': order.status === 'COMPLETED',
              'border-blue-500 text-blue-500': order.status === 'ASSIGNED',
              'border-amber-500 text-amber-500': order.status === 'IN_PROGRESS',
              'border-orange-500 text-orange-500': order.status === 'PENDING_CONFIRMATION',
              'border-primary text-primary': order.status === 'ISSUED',
              'border-destructive text-destructive': order.status === 'CANCELLED',
            }"
          >
            <CircleDotIcon class="size-4" />
          </span>

          <span class="min-w-0 flex-1">
            <span class="flex flex-wrap items-center gap-x-3 gap-y-1">
              <strong class="text-base text-foreground tabular-nums">
                {{ order.order_no }}
              </strong>
              <span
                class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                :class="{
                  'bg-success/10 text-success': order.status === 'COMPLETED',
                  'bg-blue-500/10 text-blue-700 dark:text-blue-400': order.status === 'ASSIGNED',
                  'bg-amber-500/10 text-amber-700 dark:text-amber-400': order.status === 'IN_PROGRESS',
                  'bg-orange-500/10 text-orange-700 dark:text-orange-400': order.status === 'PENDING_CONFIRMATION',
                  'bg-primary/10 text-primary': order.status === 'ISSUED',
                  'bg-destructive/10 text-destructive': order.status === 'CANCELLED',
                }"
              >
                {{ orderStatusLabels[order.status] }}
              </span>
            </span>

            <span class="mt-2.5 grid gap-1.5 text-sm sm:grid-cols-[160px_minmax(0,1fr)]">
              <span class="font-semibold tabular-nums text-foreground">
                {{ formatTime(order.trip_schedule?.scheduled_start_at) }} →
                {{ formatTime(order.trip_schedule?.scheduled_end_at) }}
              </span>
              <span class="truncate text-muted-foreground">
                {{ order.trip_schedule?.route?.name ?? order.trip_schedule?.pickup_location ?? 'Chưa có tuyến' }}
              </span>
            </span>

            <span class="mt-2 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
              <span class="truncate">
                Khách hàng:
                <strong class="font-medium text-foreground">
                  {{ order.trip_schedule?.contract?.customer?.name ?? order.trip_schedule?.contract?.contract_no ?? '—' }}
                </strong>
              </span>
              <span class="truncate">
                Xe:
                <strong class="font-medium text-foreground tabular-nums">
                  {{ order.trip_assignment?.vehicle?.license_plate ?? '—' }}
                </strong>
              </span>
            </span>
          </span>

          <div class="grid size-8 shrink-0 place-items-center rounded-full bg-muted/50 text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <ChevronRightIcon class="size-4" />
          </div>
        </button>
      </div>
    </div>
  </section>
</template>
